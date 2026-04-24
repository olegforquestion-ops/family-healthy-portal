import { calculateCompletionRate, calculateTargetPercent } from "@/modules/goals/service";

export function summarizePersonalDashboard(input: {
  caloriesActual: number;
  caloriesTarget: number;
  waterActual: number;
  waterTarget: number;
  workoutCalories: number;
  activeGoals: number;
  completedGoals: number;
}) {
  return {
    caloriesPercent: calculateTargetPercent(input.caloriesActual, input.caloriesTarget),
    waterPercent: calculateTargetPercent(input.waterActual, input.waterTarget),
    goalCompletionRate: calculateCompletionRate(input.completedGoals, input.activeGoals),
    workoutCalories: input.workoutCalories,
  };
}

export function summarizeFamilyDashboard(users: Array<{ goalsCompleted: number; goalsTotal: number }>) {
  const goalsCompleted = users.reduce((sum, user) => sum + user.goalsCompleted, 0);
  const goalsTotal = users.reduce((sum, user) => sum + user.goalsTotal, 0);

  return {
    members: users.length,
    goalsCompleted,
    goalsTotal,
    goalCompletionRate: calculateCompletionRate(goalsCompleted, goalsTotal),
  };
}
