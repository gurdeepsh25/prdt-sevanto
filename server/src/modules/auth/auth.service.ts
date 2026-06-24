import { v4 as uuidv4 } from "uuid";
import type { Prisma, User } from "@prisma/client";
import { addMinutes, addHours, addDays } from "date-fns";

import { prisma } from "../../infra/prisma/client.js";
import { hashPassword, verifyPassword } from "../../common/utils/password.js";
import { generateOpaqueToken, hashToken } from "../../common/utils/tokens.js";
import { signAccessToken } from "../../common/utils/jwt.js";
import { ttlToMs } from "../../common/utils/jwt.js";
import { getRedis } from "../../infra/redis/client.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../infra/mail/templates.js";

import {
  ConflictError,
  UnauthenticatedError,
  GoneError,
  NotFoundError,
  BusinessRuleError,
} from "../../common/errors/AppError.js";

import {
  recordFailure,
  recordSuccess,
} from "../../common/utils/loginThrottle.js";
import type {
  LoginInput,
  SignupInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.validators.js";
import { env } from "../../config/env.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string; // raw, returned once to client
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
}

const REFRESH_TTL_MS = () => ttlToMs(env.JWT_REFRESH_TTL);
const ACCESS_TTL_MS = () => ttlToMs(env.JWT_ACCESS_TTL);

async function issueTokensForUser(
  user: { id: string; role: User["role"] },
  meta: { userAgent?: string; ip?: string; familyId?: string },
): Promise<AuthTokens> {
  const jti = uuidv4();
  const accessToken = signAccessToken({ sub: user.id, role: user.role, jti });

  const rawRefresh = generateOpaqueToken(32);
  const tokenHash = hashToken(rawRefresh);
  const familyId = meta.familyId ?? uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS());

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      familyId,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip,
    },
  });

  return {
    accessToken,
    refreshToken: rawRefresh,
    accessTokenExpiresIn: Math.floor(ACCESS_TTL_MS() / 1000),
    refreshTokenExpiresIn: Math.floor(REFRESH_TTL_MS() / 1000),
  };
}

async function revokeFamily(familyId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  // Denylist in Redis for fast reject.
  const r = getRedis();
  if (r) {
    await r.set(
      `sess:revoked:${familyId}`,
      "1",
      "EX",
      Math.floor(REFRESH_TTL_MS() / 1000),
    );
  }
}

async function isFamilyRevoked(familyId: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    return (await r.exists(`sess:revoked:${familyId}`)) === 1;
  } catch {
    return false;
  }
}

// =====================================================
// signup
// =====================================================
export async function signup(
  input: SignupInput,
  meta: { userAgent?: string; ip?: string },
) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ConflictError("Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
    },
  });

  // Issue verification token (raw once to email).
  const rawToken = generateOpaqueToken(32);
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: addHours(new Date(), 1),
    },
  });

  await sendVerificationEmail(user.email, user.fullName, rawToken);

  const tokens = await issueTokensForUser(user, meta);
  return { user: publicUser(user), tokens };
}

// =====================================================
// login
// =====================================================
export async function login(
  input: LoginInput,
  meta: { userAgent?: string; ip?: string },
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.deletedAt) {
    // Constant-ish time defense: still hash a dummy to mitigate user enumeration via timing.
    await verifyPassword(
      "$argon2id$v=19$m=19456,t=2,p=1$YWFhYWFhYWFhYWFhYWFhYQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG",
      input.password,
    );
    throw new UnauthenticatedError("Invalid credentials");
  }

  if (!user.isActive) throw new UnauthenticatedError("Account is suspended");
  if (!user.isEmailVerified)
    throw new UnauthenticatedError("Email is not verified");

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) {
    const { locked, until } = await recordFailure(`user:${user.id}`);
    if (locked) {
      throw new UnauthenticatedError(
        `Account locked. Try again after ${until?.toISOString() ?? "soon"}.`,
      );
    }
    throw new UnauthenticatedError("Invalid credentials");
  }

  await recordSuccess(`user:${user.id}`);
  const tokens = await issueTokensForUser(user, meta);
  return { user: publicUser(user), tokens };
}

// =====================================================
// refresh
// =====================================================
export async function refresh(
  input: { refreshToken: string },
  meta: { userAgent?: string; ip?: string },
) {
  const tokenHash = hashToken(input.refreshToken);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row) throw new UnauthenticatedError("Invalid refresh token");
  if (row.revokedAt) {
    // Reuse detection: revoke entire family.
    await revokeFamily(row.familyId);
    throw new UnauthenticatedError("Refresh token reuse detected");
  }
  if (row.expiresAt < new Date()) throw new GoneError("Refresh token expired");
  if (await isFamilyRevoked(row.familyId)) {
    throw new UnauthenticatedError("Session revoked");
  }

  const user = await prisma.user.findUnique({ where: { id: row.userId } });
  if (!user || !user.isActive || user.deletedAt) {
    throw new UnauthenticatedError("Account unavailable");
  }

  // Rotate: revoke old, issue new in same family.
  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokensForUser(
    { id: user.id, role: user.role },
    { userAgent: meta.userAgent, ip: meta.ip, familyId: row.familyId },
  );
  return { user: publicUser(user), tokens };
}

// =====================================================
// logout
// =====================================================
export async function logout(input: { refreshToken: string }): Promise<void> {
  const tokenHash = hashToken(input.refreshToken);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (row && !row.revokedAt) {
    await prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    // Optionally revoke the entire family on logout for stricter security.
    await revokeFamily(row.familyId);
  }
}

// =====================================================
// verify email
// =====================================================
export async function verifyEmail(
  input: VerifyEmailInput,
): Promise<{ user: PublicUser }> {
  const tokenHash = hashToken(input.token);
  const row = await prisma.emailVerification.findUnique({
    where: { tokenHash },
  });
  if (!row) throw new NotFoundError("Verification link is invalid");
  if (row.usedAt) throw new GoneError("Verification link already used");
  if (row.expiresAt < new Date())
    throw new GoneError("Verification link expired");

  await prisma.$transaction([
    prisma.emailVerification.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { isEmailVerified: true },
    }),
  ]);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: row.userId },
  });
  return { user: publicUser(user) };
}

// =====================================================
// resend verification
// =====================================================
export async function resendVerification(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isEmailVerified || user.deletedAt) return; // No enumeration

  // Invalidate old unused tokens.
  await prisma.emailVerification.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { expiresAt: new Date() },
  });

  const rawToken = generateOpaqueToken(32);
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: addHours(new Date(), 1),
    },
  });
  await sendVerificationEmail(user.email, user.fullName, rawToken);
}

// =====================================================
// forgot password
// =====================================================
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) return; // Always success (no enumeration)

  await prisma.passwordReset.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { expiresAt: new Date() },
  });

  const rawToken = generateOpaqueToken(32);
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: addMinutes(new Date(), 15),
    },
  });
  await sendPasswordResetEmail(user.email, user.fullName, rawToken);
}

// =====================================================
// reset password
// =====================================================
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(input.token);
  const row = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!row) throw new NotFoundError("Reset link is invalid");
  if (row.usedAt) throw new GoneError("Reset link already used");
  if (row.expiresAt < new Date()) throw new GoneError("Reset link expired");

  const user = await prisma.user.findUnique({ where: { id: row.userId } });
  if (!user || user.deletedAt) throw new NotFoundError("User not found");

  const newHash = await hashPassword(input.password);
  if (await verifyPassword(user.passwordHash, input.password)) {
    throw new BusinessRuleError(
      "New password must be different from current password",
    );
  }

  await prisma.$transaction([
    prisma.passwordReset.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    }),
  ]);

  // Revoke all refresh tokens for this user.
  const tokens = await prisma.refreshToken.findMany({
    where: { userId: user.id, revokedAt: null },
    select: { familyId: true },
  });
  const families = Array.from(new Set(tokens.map((t) => t.familyId)));
  for (const familyId of families) {
    await revokeFamily(familyId);
  }
}

// =====================================================
// helpers
// =====================================================
export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: User["role"];
  isEmailVerified: boolean;
  createdAt: Date;
}

function publicUser(u: User): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt,
  };
}

// Re-export utilities for controllers
export { publicUser };

// Used by tests/dev to ensure env access
export const _envForTesting = env;

// Type export for controller imports
export type { Prisma };
