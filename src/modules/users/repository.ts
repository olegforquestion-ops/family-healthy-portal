import { prisma } from "@/lib/prisma";

export async function listUsersWithSummaries() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      role: true,
      profile: {
        include: {
          profileGoalType: true,
        },
      },
      weightEntries: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
      nutritionNormSnapshots: {
        where: { isCurrent: true },
        orderBy: { calculatedAt: "desc" },
        take: 1,
      },
    },
  });

  return users;
}
