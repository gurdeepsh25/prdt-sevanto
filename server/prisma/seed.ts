import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

/**
 * Phase 4 initial taxonomy seed.
 * Idempotent: uses upsert keyed on slug/name.
 */
async function seedTaxonomy(): Promise<void> {
  type SubSpec = { name: string; slug: string };
  type CatSpec = {
    name: string;
    slug: string;
    iconKey: string;
    sortOrder: number;
    subcategories: SubSpec[];
    skills: { name: string; slug: string; subSlug?: string }[];
  };

  const tree: CatSpec[] = [
    {
      name: "Home Services",
      slug: "home-services",
      iconKey: "wrench",
      sortOrder: 1,
      subcategories: [
        { name: "Plumbing", slug: "plumbing" },
        { name: "Electrical", slug: "electrical" },
        { name: "Carpentry", slug: "carpentry" },
        { name: "Painting", slug: "painting" },
        { name: "Appliance Repair", slug: "appliance-repair" },
      ],
      skills: [
        { name: "Pipe Fitting", slug: "pipe-fitting", subSlug: "plumbing" },
        { name: "Drain Cleaning", slug: "drain-cleaning", subSlug: "plumbing" },
        { name: "Wiring", slug: "wiring", subSlug: "electrical" },
        {
          name: "Switchboard Repair",
          slug: "switchboard-repair",
          subSlug: "electrical",
        },
        {
          name: "Furniture Assembly",
          slug: "furniture-assembly",
          subSlug: "carpentry",
        },
        {
          name: "Interior Painting",
          slug: "interior-painting",
          subSlug: "painting",
        },
        { name: "AC Repair", slug: "ac-repair", subSlug: "appliance-repair" },
      ],
    },
    {
      name: "Cleaning",
      slug: "cleaning",
      iconKey: "sparkles",
      sortOrder: 2,
      subcategories: [
        { name: "Home Cleaning", slug: "home-cleaning" },
        { name: "Office Cleaning", slug: "office-cleaning" },
        { name: "Deep Cleaning", slug: "deep-cleaning" },
      ],
      skills: [
        {
          name: "Bathroom Cleaning",
          slug: "bathroom-cleaning",
          subSlug: "home-cleaning",
        },
        {
          name: "Kitchen Cleaning",
          slug: "kitchen-cleaning",
          subSlug: "home-cleaning",
        },
        {
          name: "Carpet Shampooing",
          slug: "carpet-shampooing",
          subSlug: "deep-cleaning",
        },
      ],
    },
    {
      name: "Tutoring",
      slug: "tutoring",
      iconKey: "book",
      sortOrder: 3,
      subcategories: [
        { name: "School Subjects", slug: "school-subjects" },
        { name: "Languages", slug: "languages" },
        { name: "Music", slug: "music" },
      ],
      skills: [
        { name: "Math Tutor", slug: "math-tutor", subSlug: "school-subjects" },
        {
          name: "Science Tutor",
          slug: "science-tutor",
          subSlug: "school-subjects",
        },
        { name: "English Tutor", slug: "english-tutor", subSlug: "languages" },
        { name: "Hindi Tutor", slug: "hindi-tutor", subSlug: "languages" },
        { name: "Guitar Lessons", slug: "guitar-lessons", subSlug: "music" },
        { name: "Piano Lessons", slug: "piano-lessons", subSlug: "music" },
      ],
    },
    {
      name: "Beauty & Wellness",
      slug: "beauty-wellness",
      iconKey: "scissors",
      sortOrder: 4,
      subcategories: [
        { name: "Salon at Home", slug: "salon-at-home" },
        { name: "Spa & Massage", slug: "spa-massage" },
        { name: "Makeup", slug: "makeup" },
      ],
      skills: [
        { name: "Haircut", slug: "haircut", subSlug: "salon-at-home" },
        { name: "Facial", slug: "facial", subSlug: "spa-massage" },
        { name: "Bridal Makeup", slug: "bridal-makeup", subSlug: "makeup" },
      ],
    },
    {
      name: "Fitness",
      slug: "fitness",
      iconKey: "dumbbell",
      sortOrder: 5,
      subcategories: [
        { name: "Personal Trainer", slug: "personal-trainer" },
        { name: "Yoga", slug: "yoga" },
      ],
      skills: [
        {
          name: "Strength Training",
          slug: "strength-training",
          subSlug: "personal-trainer",
        },
        {
          name: "Weight Loss Coaching",
          slug: "weight-loss-coaching",
          subSlug: "personal-trainer",
        },
        { name: "Hatha Yoga", slug: "hatha-yoga", subSlug: "yoga" },
      ],
    },
    {
      name: "Tech Help",
      slug: "tech-help",
      iconKey: "laptop",
      sortOrder: 6,
      subcategories: [
        { name: "Computer Repair", slug: "computer-repair" },
        { name: "Mobile Repair", slug: "mobile-repair" },
        { name: "Smart Home Setup", slug: "smart-home-setup" },
      ],
      skills: [
        {
          name: "Laptop Repair",
          slug: "laptop-repair",
          subSlug: "computer-repair",
        },
        {
          name: "Screen Replacement",
          slug: "screen-replacement",
          subSlug: "mobile-repair",
        },
        {
          name: "CCTV Installation",
          slug: "cctv-installation",
          subSlug: "smart-home-setup",
        },
      ],
    },
    {
      name: "Other",
      slug: "other",
      iconKey: "tag",
      sortOrder: 99,
      subcategories: [{ name: "Miscellaneous", slug: "miscellaneous" }],
      skills: [],
    },
  ];

  let catCount = 0;
  let subCount = 0;
  let skillCount = 0;

  for (const cat of tree) {
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        iconKey: cat.iconKey,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        iconKey: cat.iconKey,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    catCount += 1;

    for (const sub of cat.subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: { categoryId: dbCat.id, slug: sub.slug },
        },
        update: { name: sub.name, isActive: true },
        create: {
          categoryId: dbCat.id,
          name: sub.name,
          slug: sub.slug,
          isActive: true,
        },
      });
      subCount += 1;
    }

    for (const sk of cat.skills) {
      let subcategoryId: string | null = null;
      if (sk.subSlug) {
        const sub = await prisma.subcategory.findUnique({
          where: {
            categoryId_slug: { categoryId: dbCat.id, slug: sk.subSlug },
          },
          select: { id: true },
        });
        subcategoryId = sub?.id ?? null;
      }
      await prisma.skill.upsert({
        where: { slug: sk.slug },
        update: {
          name: sk.name,
          subcategoryId,
          isActive: true,
        },
        create: {
          name: sk.name,
          slug: sk.slug,
          subcategoryId,
          isActive: true,
        },
      });
      skillCount += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `✅ Taxonomy seed: ${catCount} categories, ${subCount} subcategories, ${skillCount} skills`,
  );
}

async function main(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.ADMIN_FULL_NAME) {
    // eslint-disable-next-line no-console
    console.log("⚠️  Seed: ADMIN_* env vars missing. Skipping admin seed.");
  } else {
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

  await seedTaxonomy();
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
