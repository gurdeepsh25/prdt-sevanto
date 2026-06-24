import { describe, it, expect } from "vitest";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  addressUpdateSchema,
  adminUserListQuerySchema,
  adminUpdateUserSchema,
} from "../../src/modules/users/users.validators";

describe("updateProfileSchema", () => {
  it("accepts a full name update", () => {
    expect(
      updateProfileSchema.safeParse({ fullName: "Jane Doe" }).success,
    ).toBe(true);
  });
  it("accepts an E.164 phone", () => {
    expect(
      updateProfileSchema.safeParse({ phone: "+919876543210" }).success,
    ).toBe(true);
  });
  it("rejects a non-E.164 phone", () => {
    expect(updateProfileSchema.safeParse({ phone: "9876543210" }).success).toBe(
      false,
    );
    expect(updateProfileSchema.safeParse({ phone: "+0123456" }).success).toBe(
      false,
    );
  });
  it("accepts explicit null to clear a field", () => {
    expect(updateProfileSchema.safeParse({ phone: null }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ avatarUrl: null }).success).toBe(
      true,
    );
  });
  it("rejects unknown fields", () => {
    expect(
      updateProfileSchema.safeParse({ fullName: "Jane", password: "x" })
        .success,
    ).toBe(false);
  });
  it("rejects empty payloads", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid passwords", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "Old1Password",
        newPassword: "New1Password",
      }).success,
    ).toBe(true);
  });
  it("rejects weak new password", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "Old",
        newPassword: "short",
      }).success,
    ).toBe(false);
  });
});

describe("addressSchema", () => {
  const valid = {
    line1: "12 MG Road",
    city: "Bengaluru",
    state: "KA",
    postalCode: "560001",
  };
  it("accepts a minimal valid address", () => {
    expect(addressSchema.safeParse(valid).success).toBe(true);
  });
  it("requires line1, city, state, postalCode", () => {
    expect(addressSchema.safeParse({ ...valid, line1: "" }).success).toBe(
      false,
    );
    expect(addressSchema.safeParse({ ...valid, city: "" }).success).toBe(false);
  });
  it("validates lat/lng ranges when provided", () => {
    expect(addressSchema.safeParse({ ...valid, lat: 91 }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, lng: -181 }).success).toBe(
      false,
    );
  });
  it("defaults country to IN", () => {
    const r = addressSchema.safeParse(valid);
    if (r.success) expect(r.data.country).toBe("IN");
  });
});

describe("addressUpdateSchema", () => {
  it("accepts partial updates", () => {
    expect(addressUpdateSchema.safeParse({ city: "Mumbai" }).success).toBe(
      true,
    );
  });
  it("rejects unknown fields", () => {
    expect(addressUpdateSchema.safeParse({ id: "foo" }).success).toBe(false);
  });
  it("rejects empty payloads", () => {
    expect(addressUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe("adminUserListQuerySchema", () => {
  it("coerces numeric query strings", () => {
    const r = adminUserListQuerySchema.safeParse({ page: "2", pageSize: "50" });
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.pageSize).toBe(50);
    } else {
      throw new Error("expected success");
    }
  });
  it("rejects unknown sort values", () => {
    expect(
      adminUserListQuerySchema.safeParse({ sort: "email:desc" }).success,
    ).toBe(false);
  });
});

describe("adminUpdateUserSchema", () => {
  it("accepts isActive flag", () => {
    expect(adminUpdateUserSchema.safeParse({ isActive: false }).success).toBe(
      true,
    );
  });
  it("rejects empty payloads", () => {
    expect(adminUpdateUserSchema.safeParse({}).success).toBe(false);
  });
});
