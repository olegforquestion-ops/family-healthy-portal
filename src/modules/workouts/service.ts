function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateWorkoutCaloriesByNorm(input: {
  caloriesPerUnit: number;
  quantity: number;
}) {
  return roundToTwo(input.caloriesPerUnit * input.quantity);
}

export function sumWorkoutCalories(entries: Array<{ caloriesBurned: number }>) {
  return roundToTwo(entries.reduce((sum, entry) => sum + entry.caloriesBurned, 0));
}
