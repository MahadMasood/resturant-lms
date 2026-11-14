import "dotenv/config";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  // 1. Create Super Admin (no tenant)
  const superAdminPw = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@platform.com" },
    update: {},
    create: {
      email: "admin@platform.com",
      passwordHash: superAdminPw,
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      tenantId: null,
    },
  });

  // 2. Create Tenant: Restaurant A
  const tenantA = await prisma.tenant.upsert({
    where: { id: "tenant-a" },
    update: { name: "Restaurant A" },
    create: { id: "tenant-a", name: "Restaurant A" },
  });

  // 3. Manager for Restaurant A
  const managerPw = await bcrypt.hash("manager123", 12);
  await prisma.user.upsert({
    where: { email: "manager@restaurant-a.com" },
    update: {},
    create: {
      email: "manager@restaurant-a.com",
      passwordHash: managerPw,
      name: "Alex Manager",
      role: Role.MANAGER,
      tenantId: tenantA.id,
    },
  });

  // 4. Staff members
  const staffPw = await bcrypt.hash("staff123", 12);
  await prisma.user.upsert({
    where: { email: "john.doe@restaurant-a.com" },
    update: {},
    create: {
      email: "john.doe@restaurant-a.com",
      passwordHash: staffPw,
      name: "John Doe",
      role: Role.STAFF,
      tenantId: tenantA.id,
    },
  });
  await prisma.user.upsert({
    where: { email: "jane.smith@restaurant-a.com" },
    update: {},
    create: {
      email: "jane.smith@restaurant-a.com",
      passwordHash: staffPw,
      name: "Jane Smith",
      role: Role.STAFF,
      tenantId: tenantA.id,
    },
  });

  // 5. Module: Food Safety Protocols (tenant A)
  const module1 = await prisma.module.upsert({
    where: { id: "module-food-safety" },
    update: {},
    create: {
      id: "module-food-safety",
      tenantId: tenantA.id,
      title: "Food Safety Protocols",
      description: "Essential food handling, temperature control, and hygiene standards every team member must know.",
      videoUrl: "/videos/module1-safety-protocols.mp4",
      orderIndex: 1,
    },
  });

  // 6. Quiz questions for module 1
  const questionsData = [
    {
      questionText: "What is the minimum safe internal temperature for cooked poultry?",
      options: ["145°F (63°C)", "155°F (68°C)", "165°F (74°C)", "175°F (79°C)"],
      correctAnswer: 2,
    },
    {
      questionText: "How often should food handlers change gloves when working continuously?",
      options: ["Every 2 hours", "Every 4 hours", "Every 6 hours", "Only when visibly soiled"],
      correctAnswer: 1,
    },
    {
      questionText: "Which of the following is NOT a correct handwashing procedure?",
      options: [
        "Scrub hands for at least 20 seconds",
        "Use warm water and soap",
        "Rinse hands with cold water only",
        "Dry hands with a clean paper towel",
      ],
      correctAnswer: 2,
    },
  ];

  // Delete existing questions for clean re-seed
  await prisma.question.deleteMany({ where: { moduleId: module1.id } });
  await prisma.question.createMany({
    data: questionsData.map((q) => ({ ...q, moduleId: module1.id })),
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
