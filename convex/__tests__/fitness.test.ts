import { describe, test, expect } from "vitest";

// Pure logic tests for fitness calculations (no convex-test)
// Mirrors the aggregation logic in convex/functions/fitness.ts

function calcExerciseSummary(
  entries: Array<{
    caloriesBurned?: number;
    duration?: number;
    sets?: number;
    reps?: number;
    weight?: number;
  }>
) {
  let totalCaloriesBurned = 0;
  let totalDuration = 0;
  let totalVolume = 0;

  for (const data of entries) {
    totalCaloriesBurned += data.caloriesBurned ?? 0;
    totalDuration += data.duration ?? 0;
    if (data.sets && data.reps && data.weight) {
      totalVolume += data.sets * data.reps * data.weight;
    }
  }

  return {
    totalCaloriesBurned,
    exerciseCount: entries.length,
    totalDuration,
    totalVolume,
  };
}

function calcPersonalRecords(
  entries: Array<{
    name: string;
    type: string;
    sets?: number;
    reps?: number;
    weight?: number;
    timestamp: number;
  }>
) {
  const prMap = new Map<
    string,
    { bestWeight: number; bestReps: number; bestVolume: number; date: number }
  >();

  for (const data of entries) {
    if (data.type !== "strength" || !data.weight) continue;

    const name = data.name;
    const existing = prMap.get(name);
    const volume = (data.sets ?? 1) * (data.reps ?? 1) * data.weight;

    if (!existing) {
      prMap.set(name, {
        bestWeight: data.weight,
        bestReps: data.reps ?? 0,
        bestVolume: volume,
        date: data.timestamp,
      });
    } else {
      if (data.weight > existing.bestWeight) {
        existing.bestWeight = data.weight;
        existing.date = data.timestamp;
      }
      if ((data.reps ?? 0) > existing.bestReps) {
        existing.bestReps = data.reps!;
      }
      if (volume > existing.bestVolume) {
        existing.bestVolume = volume;
      }
    }
  }

  return Array.from(prMap.entries()).map(([exerciseName, pr]) => ({
    exerciseName,
    ...pr,
  }));
}

describe("fitness", () => {
  test("calcula totales de un ejercicio", () => {
    const summary = calcExerciseSummary([
      { sets: 4, reps: 10, weight: 80, duration: 15, caloriesBurned: 120 },
    ]);

    expect(summary.exerciseCount).toBe(1);
    expect(summary.totalCaloriesBurned).toBe(120);
    expect(summary.totalDuration).toBe(15);
    expect(summary.totalVolume).toBe(3200); // 4*10*80
  });

  test("suma multiples ejercicios correctamente", () => {
    const summary = calcExerciseSummary([
      { sets: 4, reps: 10, weight: 80, duration: 15, caloriesBurned: 120 },
      { sets: 3, reps: 8, weight: 100, duration: 12, caloriesBurned: 150 },
    ]);

    expect(summary.exerciseCount).toBe(2);
    expect(summary.totalCaloriesBurned).toBe(270);
    expect(summary.totalDuration).toBe(27);
    expect(summary.totalVolume).toBe(5600); // (4*10*80) + (3*8*100)
  });

  test("retorna ceros sin datos", () => {
    const summary = calcExerciseSummary([]);
    expect(summary.exerciseCount).toBe(0);
    expect(summary.totalCaloriesBurned).toBe(0);
    expect(summary.totalVolume).toBe(0);
  });

  test("calculo de volumen: sets * reps * weight", () => {
    const summary = calcExerciseSummary([
      { sets: 3, reps: 12, weight: 15 },
    ]);
    expect(summary.totalVolume).toBe(540); // 3*12*15
  });

  test("ejercicio cardio no suma volumen", () => {
    const summary = calcExerciseSummary([
      { duration: 30, caloriesBurned: 300 },
    ]);
    expect(summary.exerciseCount).toBe(1);
    expect(summary.totalCaloriesBurned).toBe(300);
    expect(summary.totalDuration).toBe(30);
    expect(summary.totalVolume).toBe(0);
  });

  test("getPersonalRecords calcula PRs correctamente", () => {
    const now = Date.now();
    const records = calcPersonalRecords([
      { name: "Press banca", type: "strength", sets: 4, reps: 10, weight: 60, timestamp: now - 86400000 * 3 },
      { name: "Press banca", type: "strength", sets: 4, reps: 10, weight: 80, timestamp: now - 86400000 },
      { name: "Press banca", type: "strength", sets: 3, reps: 12, weight: 70, timestamp: now },
      { name: "Sentadilla", type: "strength", sets: 3, reps: 8, weight: 100, timestamp: now },
    ]);

    expect(records).toHaveLength(2);

    const bench = records.find((r) => r.exerciseName === "Press banca");
    expect(bench?.bestWeight).toBe(80);
    expect(bench?.bestReps).toBe(12);

    const squat = records.find((r) => r.exerciseName === "Sentadilla");
    expect(squat?.bestWeight).toBe(100);
  });

  test("getPersonalRecords retorna array vacio sin datos", () => {
    const records = calcPersonalRecords([]);
    expect(records).toHaveLength(0);
  });

  test("cardio no cuenta como PR", () => {
    const records = calcPersonalRecords([
      { name: "Correr", type: "cardio", timestamp: Date.now() },
    ]);
    expect(records).toHaveLength(0);
  });
});
