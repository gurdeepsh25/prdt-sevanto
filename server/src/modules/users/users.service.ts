import type { User, UserAddress } from "@prisma/client";
import { prisma } from "../../infra/prisma/client.js";
import { hashPassword, verifyPassword } from "../../common/utils/password.js";
import {
  ConflictError,
  UnauthenticatedError,
  NotFoundError,
  BusinessRuleError,
  ForbiddenError,
} from "../../common/errors/AppError.js";
import type {
  AddressInput,
  AddressUpdateInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from "./users.validators.js";

// =====================================================
// Me
// =====================================================
export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new UnauthenticatedError("User not found");
  return toPublicUser(user);
}

export async function updateMe(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing || existing.deletedAt)
    throw new UnauthenticatedError("User not found");

  const data: {
    fullName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
  } = {};
  if (input.fullName !== undefined) data.fullName = input.fullName.trim();
  if (input.phone !== undefined) data.phone = input.phone ? input.phone : null;
  if (input.avatarUrl !== undefined)
    data.avatarUrl = input.avatarUrl ? input.avatarUrl : null;

  const updated = await prisma.user.update({ where: { id: userId }, data });
  return toPublicUser(updated);
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new UnauthenticatedError("User not found");

  const ok = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!ok) throw new UnauthenticatedError("Current password is incorrect");

  // Prevent setting a new password that matches the current one.
  if (await verifyPassword(user.passwordHash, input.newPassword)) {
    throw new BusinessRuleError(
      "New password must be different from current password",
    );
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Revoke all refresh tokens — user must re-authenticate on other devices.
  await revokeAllRefreshTokens(userId);
}

export async function softDeleteMe(
  userId: string,
  refreshToken?: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new NotFoundError("User not found");

  const now = new Date();
  // Anonymize PII; preserve email uniqueness by suffixing deleted marker.
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: now,
      isActive: false,
      fullName: "Deleted user",
      phone: null,
      avatarUrl: null,
      email: `${user.email}__deleted__${user.id.slice(0, 8)}`,
    },
  });

  await revokeAllRefreshTokens(userId);
  // Hint: if the caller passed the current refresh token, also revoke its family.
  if (refreshToken) {
    const { hashToken } = await import("../../common/utils/tokens.js");
    const row = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });
    if (row) {
      await prisma.refreshToken.updateMany({
        where: { familyId: row.familyId, revokedAt: null },
        data: { revokedAt: now },
      });
    }
  }
}

// =====================================================
// Avatar upload — Phase 2 produces a key + URL.
// The actual S3/R2 upload happens client-side from a pre-signed URL.
// For MVP, we just accept the URL after the client uploads.
// =====================================================
export interface AvatarUploadTicket {
  key: string;
  url: string;
  expiresAt: Date;
}

export async function issueAvatarUploadTicket(
  _userId: string,
): Promise<AvatarUploadTicket> {
  // Without an S3/R2 integration in MVP, we return a placeholder contract.
  // A real implementation would mint an S3 PutObject pre-signed URL here.
  const key = `avatars/pending/${crypto.randomUUID()}`;
  return {
    key,
    url: `${process.env.STORAGE_PUBLIC_URL ?? ""}/${key}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

// =====================================================
// Addresses
// =====================================================
export async function listAddresses(userId: string): Promise<PublicAddress[]> {
  const rows = await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toPublicAddress);
}

export async function createAddress(
  userId: string,
  input: AddressInput,
): Promise<PublicAddress> {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    // If this is the user's first address, force default.
    const existing = await tx.userAddress.count({ where: { userId } });
    const isDefault = input.isDefault || existing === 0;

    const row = await tx.userAddress.create({
      data: {
        userId,
        label: input.label ?? null,
        line1: input.line1,
        line2: input.line2 ?? null,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        isDefault,
      },
    });
    return toPublicAddress(row);
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: AddressUpdateInput,
): Promise<PublicAddress> {
  const existing = await prisma.userAddress.findUnique({
    where: { id: addressId },
  });
  if (!existing || existing.userId !== userId)
    throw new NotFoundError("Address not found");

  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.userAddress.updateMany({
        where: { userId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }
    const data: Record<string, unknown> = {};
    if (input.label !== undefined) data.label = input.label;
    if (input.line1 !== undefined) data.line1 = input.line1;
    if (input.line2 !== undefined) data.line2 = input.line2;
    if (input.city !== undefined) data.city = input.city;
    if (input.state !== undefined) data.state = input.state;
    if (input.postalCode !== undefined) data.postalCode = input.postalCode;
    if (input.country !== undefined) data.country = input.country;
    if (input.lat !== undefined) data.lat = input.lat;
    if (input.lng !== undefined) data.lng = input.lng;
    if (input.isDefault !== undefined) data.isDefault = input.isDefault;

    const row = await tx.userAddress.update({ where: { id: addressId }, data });
    return toPublicAddress(row);
  });
}

export async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  const existing = await prisma.userAddress.findUnique({
    where: { id: addressId },
  });
  if (!existing || existing.userId !== userId)
    throw new NotFoundError("Address not found");
  await prisma.userAddress.delete({ where: { id: addressId } });
  // If we just deleted the default, promote the most recent remaining address.
  if (existing.isDefault) {
    const next = await prisma.userAddress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next)
      await prisma.userAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
  }
}

// =====================================================
// Admin
// =====================================================
export async function adminListUsers(query: {
  page: number;
  pageSize: number;
  role?: "CUSTOMER" | "WORKER" | "ADMIN";
  status?: "active" | "suspended";
  search?: string;
  sort: string;
}): Promise<{
  items: PublicUser[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const where: Record<string, unknown> = { deletedAt: null };
  if (query.role) where.role = query.role;
  if (query.status === "active") where.isActive = true;
  if (query.status === "suspended") where.isActive = false;
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { fullName: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [field, direction] = query.sort.split(":") as [string, "asc" | "desc"];

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [field]: direction },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: items.map(toPublicUser),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function adminGetUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new NotFoundError("User not found");
  return toPublicUser(user);
}

export async function adminUpdateUser(
  adminId: string,
  userId: string,
  input: { isActive?: boolean },
): Promise<PublicUser> {
  if (adminId === userId && input.isActive === false) {
    throw new ForbiddenError("Administrators cannot suspend their own account");
  }
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing || existing.deletedAt)
    throw new NotFoundError("User not found");
  if (existing.role === "ADMIN" && input.isActive === false) {
    throw new ForbiddenError(
      "Use a separate flow to deactivate admin accounts",
    );
  }
  const data: Record<string, unknown> = {};
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const updated = await prisma.user.update({ where: { id: userId }, data });

  // If suspending, also revoke refresh tokens to immediately invalidate sessions.
  if (input.isActive === false) {
    await revokeAllRefreshTokens(userId);
  }

  return toPublicUser(updated);
}

// =====================================================
// Helpers
// =====================================================
async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  // Mark all families revoked in Redis denylist (best-effort).
  try {
    const { getRedis } = await import("../../infra/redis/client.js");
    const r = getRedis();
    if (r) {
      const rows = await prisma.refreshToken.findMany({
        where: { userId, revokedAt: { not: null } },
        select: { familyId: true, expiresAt: true },
      });
      for (const row of rows) {
        const ttl = Math.max(
          1,
          Math.floor((row.expiresAt.getTime() - Date.now()) / 1000),
        );
        await r.set(`sess:revoked:${row.familyId}`, "1", "EX", ttl);
      }
    }
  } catch {
    // Redis unavailable — DB-only revocation is still in effect.
  }
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: User["role"];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface PublicAddress {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: Date;
}

function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    role: u.role,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt,
  };
}

function toPublicAddress(a: UserAddress): PublicAddress {
  return {
    id: a.id,
    label: a.label,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    lat: a.lat,
    lng: a.lng,
    isDefault: a.isDefault,
    createdAt: a.createdAt,
  };
}
