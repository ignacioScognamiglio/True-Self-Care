import { describe, test, expect } from "vitest";

// Pure logic tests for nutrition calculations (no convex-test)
// Mirrors the aggregation logic in convex/functions/nutrition.ts

function calcNutritionSummary(
  entries: Array<{ calories: number; protein: number; carbs: number; fat: number }>
) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const entry of entries) {
    totalCalories += entry.calories ?? 0;
    totalProtein += entry.protein ?? 0;
    totalCarbs += entry.carbs ?? 0;
    totalFat += entry.fat ?? 0;
  }

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    mealCount: entries.length,
  };
}

function groupByDay(
  entries: Array<{ timestamp: number; calories: number; protein: number; carbs: number; fat: number }>,
  numDays: number
) {
  const startOfDay = (ts: number) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const dailyMap = new Map<number, { calories: number; protein: number; carbs: number; fat: number; mealCount: number }>();

  for (const entry of entries) {
    const dayKey = startOfDay(entry.timestamp);
    const existing = dailyMap.get(dayKey) ?? { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 };
    existing.calories += entry.calories ?? 0;
    existing.protein += entry.protein ?? 0;
    existing.carbs += entry.carbs ?? 0;
    existing.fat += entry.fat ?? 0;
    existing.mealCount += 1;
    dailyMap.set(dayKey, existing);
  }

  const result = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const day = startOfDay(Date.now() - i * 24 * 60 * 60 * 1000);
    const data = dailyMap.get(day);
    result.push({
      date: day,
      totalCalories: data?.calories ?? 0,
      totalProtein: data?.protein ?? 0,
      totalCarbs: data?.carbs ?? 0,
      totalFat: data?.fat ?? 0,
      mealCount: data?.mealCount ?? 0,
    });
  }

  return result;
}

describe("nutrition", () => {
  test("suma una sola comida correctamente", () => {
    const summary = calcNutritionSummary([
      { calories: 450, protein: 35, carbs: 20, fat: 25 },
    ]);
    expect(summary.totalCalories).toBe(450);
    expect(summary.totalProtein).toBe(35);
    expect(summary.totalCarbs).toBe(20);
    expect(summary.totalFat).toBe(25);
    expect(summary.mealCount).toBe(1);
  });

  test("suma multiples comidas correctamente", () => {
    const summary = calcNutritionSummary([
      { calories: 300, protein: 15, carbs: 40, fat: 10 },
      { calories: 550, protein: 40, carbs: 45, fat: 20 },
      { calories: 400, protein: 30, carbs: 25, fat: 18 },
    ]);
    expect(summary.totalCalories).toBe(1250);
    expect(summary.totalProtein).toBe(85);
    expect(summary.totalCarbs).toBe(110);
    expect(summary.totalFat).toBe(48);
    expect(summary.mealCount).toBe(3);
  });

  test("retorna ceros sin datos", () => {
    const summary = calcNutritionSummary([]);
    expect(summary.totalCalories).toBe(0);
    expect(summary.totalProtein).toBe(0);
    expect(summary.mealCount).toBe(0);
  });

  test("agrupa historial por dia con 7 dias", () => {
    const now = Date.now();
    const result = groupByDay(
      [
        { timestamp: now, calories: 500, protein: 30, carbs: 50, fat: 20 },
        { timestamp: now, calories: 300, protein: 20, carbs: 30, fat: 10 },
        { timestamp: now - 86400000, calories: 400, protein: 25, carbs: 40, fat: 15 },
      ],
      7
    );

    expect(result).toHaveLength(7);
    // Today should have 2 meals
    const today = result[result.length - 1];
    expect(today.totalCalories).toBe(800);
    expect(today.mealCount).toBe(2);
    // Yesterday should have 1 meal
    const yesterday = result[result.length - 2];
    expect(yesterday.totalCalories).toBe(400);
    expect(yesterday.mealCount).toBe(1);
  });

  test("historial rellena dias sin datos con ceros", () => {
    const result = groupByDay([], 7);
    expect(result).toHaveLength(7);
    result.forEach((day) => {
      expect(day.totalCalories).toBe(0);
      expect(day.mealCount).toBe(0);
    });
  });

  test("multiples comidas del mismo tipo se cuentan", () => {
    const summary = calcNutritionSummary([
      { calories: 100, protein: 5, carbs: 15, fat: 3 },
      { calories: 150, protein: 8, carbs: 10, fat: 7 },
    ]);
    expect(summary.mealCount).toBe(2);
    expect(summary.totalCalories).toBe(250);
  });
});
