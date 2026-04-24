import { prisma } from "@/lib/prisma";

function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function getWaterDayData(userId: string, date = new Date()) {
  const { start, end } = getDayBounds(date);

  const [norm, profile, entries] = await Promise.all([
    prisma.nutritionNormSnapshot.findFirst({
      where: { userId, isCurrent: true },
      orderBy: { calculatedAt: "desc" },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: { waterTargetMl: true },
    }),
    prisma.waterEntry.findMany({
      where: {
        userId,
        recordedAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [{ recordedAt: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const totalMl = entries.reduce((sum, entry) => sum + entry.amountMl, 0);
  const targetMl = norm?.waterTargetMl ?? profile?.waterTargetMl ?? null;

  return {
    date: start,
    targetMl,
    totalMl,
    entries,
  };
}
