import { prisma } from "@/lib/prisma";

export async function getMeasurementsPageData(userId: string) {
  const [weights, measurements] = await Promise.all([
    prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 12,
    }),
    prisma.measurementEntry.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 24,
    }),
  ]);

  return {
    weights,
    measurements,
  };
}
