import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.ADMIN_FULL_NAME) {
    // eslint-disable-next-line no-console
    console.log("⚠️  Seed: ADMIN_* env vars missing. Skipping admin seed.");
    return;
  }

  const passwordHash = await argon2.hash(env.ADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {
      fullName: env.ADMIN_FULL_NAME,
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      email: env.ADMIN_EMAIL,
      passwordHash,
      fullName: env.ADMIN_FULL_NAME,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`✅ Admin seed: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
