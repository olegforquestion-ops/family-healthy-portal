import { prisma } from "@/lib/prisma";

export async function getProfilePageData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          profileGoalType: true,
        },
      },
      nutritionNormSnapshots: {
        where: { isCurrent: true },
        orderBy: { calculatedAt: "desc" },
        take: 1,
      },
      weightEntries: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });
}
