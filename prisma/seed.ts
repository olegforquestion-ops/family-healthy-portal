import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const familyName = process.env.BOOTSTRAP_FAMILY_NAME || "Healthy Family";
  const adminLogin = process.env.BOOTSTRAP_ADMIN_LOGIN || "admin";
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "ChangeMe123!";
  const adminDisplayName = process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME || "Admin";

  const family = await prisma.family.upsert({
    where: { id: "bootstrap-family" },
    update: { name: familyName },
    create: {
      id: "bootstrap-family",
      name: familyName,
    },
  });

  await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: { label: "Administrator" },
    create: { code: "ADMIN", label: "Administrator" },
  });

  await prisma.role.upsert({
    where: { code: "MEMBER" },
    update: { label: "User" },
    create: { code: "MEMBER", label: "User" },
  });

  const goalTypes = [
    { code: "LOSE_WEIGHT", label: "Lose weight" },
    { code: "SLOW_WEIGHT_LOSS", label: "Slow weight loss" },
    { code: "MAINTAIN_WEIGHT", label: "Maintain weight" },
    { code: "GAIN_WEIGHT", label: "Gain weight" },
  ];

  for (const goalType of goalTypes) {
    await prisma.profileGoalType.upsert({
      where: { code: goalType.code },
      update: { label: goalType.label },
      create: goalType,
    });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { login: adminLogin },
    update: {
      familyId: family.id,
      roleCode: "ADMIN",
      displayName: adminDisplayName,
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      familyId: family.id,
      roleCode: "ADMIN",
      login: adminLogin,
      passwordHash,
      displayName: adminDisplayName,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {
      firstName: adminDisplayName,
      displayName: adminDisplayName,
      profileGoalTypeCode: "MAINTAIN_WEIGHT",
    },
    create: {
      userId: admin.id,
      firstName: adminDisplayName,
      displayName: adminDisplayName,
      profileGoalTypeCode: "MAINTAIN_WEIGHT",
    },
  });

  const foods = [
    {
      name: "Greek yogurt 2%",
      type: "PRODUCT" as const,
      caloriesPer100g: 73,
      proteinPer100g: 10,
      fatPer100g: 2,
      carbsPer100g: 4,
      portionLabel: "100 g",
    },
    {
      name: "Cucumber",
      type: "PRODUCT" as const,
      caloriesPer100g: 15,
      proteinPer100g: 1,
      fatPer100g: 0.1,
      carbsPer100g: 3.6,
      portionLabel: "100 g",
    },
    {
      name: "Oatmeal with berries",
      type: "DISH" as const,
      caloriesPer100g: 118,
      proteinPer100g: 5.2,
      fatPer100g: 2.8,
      carbsPer100g: 18.4,
      portionLabel: "bowl",
    },
    {
      name: "Turkey bulgur bowl",
      type: "DISH" as const,
      caloriesPer100g: 154,
      proteinPer100g: 11.4,
      fatPer100g: 4.1,
      carbsPer100g: 10.9,
      portionLabel: "bowl",
    },
  ];

  for (const food of foods) {
    await prisma.foodItem.upsert({
      where: { id: `seed-${food.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {
        ...food,
        createdById: admin.id,
      },
      create: {
        id: `seed-${food.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ...food,
        createdById: admin.id,
      },
    });
  }

  const workoutNorms = [
    { name: "Walking", unitLabel: "km", caloriesPerUnit: 50, defaultQuantity: 3 },
    { name: "Running", unitLabel: "km", caloriesPerUnit: 80, defaultQuantity: 5 },
    { name: "Cycling", unitLabel: "km", caloriesPerUnit: 30, defaultQuantity: 10 },
    { name: "Strength training", unitLabel: "min", caloriesPerUnit: 8, defaultQuantity: 45 },
    { name: "Yoga", unitLabel: "min", caloriesPerUnit: 4, defaultQuantity: 40 },
  ];

  for (const norm of workoutNorms) {
    await prisma.workoutNorm.upsert({
      where: { id: `seed-${norm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: norm,
      create: {
        id: `seed-${norm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ...norm,
      },
    });
  }

  const goalTemplates = [
    {
      code: "TARGET_WEIGHT",
      label: "Достичь веса к дате",
      description: "Сравнивает текущий вес с целевым значением на выбранный срок.",
      unitLabel: "kg",
    },
    {
      code: "WORKOUT_COUNT",
      label: "Выполнить тренировки",
      description: "Считает количество тренировок в выбранном периоде.",
      unitLabel: "workouts",
    },
    {
      code: "DISTANCE_KM",
      label: "Пройти километры",
      description: "Суммирует тренировки с дистанцией в километрах.",
      unitLabel: "km",
    },
    {
      code: "CALORIE_DAYS_UNDER_TARGET",
      label: "Держать калории в норме",
      description: "Считает дни, когда факт по калориям не превысил текущую дневную норму.",
      unitLabel: "days",
    },
    {
      code: "WATER_DAYS_TARGET",
      label: "Выполнять норму воды",
      description: "Считает дни, когда пользователь выполнил дневную норму воды.",
      unitLabel: "days",
    },
  ];

  for (const template of goalTemplates) {
    await prisma.goalTemplate.upsert({
      where: { code: template.code },
      update: template,
      create: template,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
