export function assertAdmin(role: string) {
  if (role !== "ADMIN") {
    throw new Error("Недостаточно прав для этого действия.");
  }
}

export function assertOwnershipOrAdmin(currentUserId: string, targetUserId: string, role: string) {
  if (role === "ADMIN") {
    return;
  }

  if (currentUserId !== targetUserId) {
    throw new Error("Доступ запрещен.");
  }
}
