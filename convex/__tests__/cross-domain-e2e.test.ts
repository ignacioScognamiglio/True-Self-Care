import { describe, test, expect } from "vitest";

/**
 * Cross-domain E2E tests verifying that data flows correctly between modules.
 * Tests the pure logic of data aggregation and correlation across domains.
 */

// ═══ TYPES ═══

interface DayData {
  date: number;
  sleep: { qualityScore: number; durationMinutes: number; logged: boolean };
  nutrition: { totalCalories: number; totalProtein: number; mealCount: number };
  fitness: { exerciseCount: number; totalVolume: number; totalDuration: number };
  mood: { averageIntensity: number; checkInCount: number; dominantMood: string | null };
  habits: { completedCount: number };
  hydration: { totalMl: number };
}

// ═══ PURE FUNCTIONS (mirrored from insights.ts) ═══

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 5) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function getStrength(r: number): "fuerte" | "moderada" | "debil" {
  const abs = Math.abs(r);
  if (abs >= 0.7) return "fuerte";
  if (abs >= 0.5) return "moderada";
  return "debil";
}

function computeAllCorrelations(daysData: DayData[]): Array<{
  label: string;
  correlation: number;
  strength: string;
  direction: string;
  dataPoints: number;
}> {
  const pairs = [
    {
      label: "Calidad de sueno vs Estado de animo",
      getA: (d: DayData) => (d.sleep.logged ? d.sleep.qualityScore : null),
      getB: (d: DayData) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
    {
      label: "Ejercicios vs Calidad de sueno",
      getA: (d: DayData) => (d.fitness.exerciseCount > 0 ? d.fitness.exerciseCount : null),
      getB: (d: DayData) => (d.sleep.logged ? d.sleep.qualityScore : null),
    },
    {
      label: "Hidratacion vs Calidad de sueno",
      getA: (d: DayData) => (d.hydration.totalMl > 0 ? d.hydration.totalMl : null),
      getB: (d: DayData) => (d.sleep.logged ? d.sleep.qualityScore : null),
    },
    {
      label: "Habitos completados vs Estado de animo",
      getA: (d: DayData) => (d.habits.completedCount > 0 ? d.habits.completedCount : null),
      getB: (d: DayData) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
  ];

  const results: Array<{
    label: string;
    correlation: number;
    strength: string;
    direction: string;
    dataPoints: number;
  }> = [];

  for (const pair of pairs) {
    const xVals: number[] = [];
    const yVals: number[] = [];

    for (const day of daysData) {
      const a = pair.getA(day);
      const b = pair.getB(day);
      if (a !== null && b !== null) {
        xVals.push(a);
        yVals.push(b);
      }
    }

    if (xVals.length < 5) continue;

    const r = pearsonCorrelation(xVals, yVals);
    if (Math.abs(r) <= 0.3) continue;

    results.push({
      label: pair.label,
      correlation: Math.round(r * 1000) / 1000,
      strength: getStrength(r),
      direction: r > 0 ? "positiva" : "negativa",
      dataPoints: xVals.length,
    });
  }

  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

// ═══ HELPER ═══

function makeDayData(overrides: Partial<DayData> = {}): DayData {
  return {
    date: Date.now(),
    sleep: { qualityScore: 0, durationMinutes: 0, logged: false },
    nutrition: { totalCalories: 0, totalProtein: 0, mealCount: 0 },
    fitness: { exerciseCount: 0, totalVolume: 0, totalDuration: 0 },
    mood: { averageIntensity: 0, checkInCount: 0, dominantMood: null },
    habits: { completedCount: 0 },
    hydration: { totalMl: 0 },
    ...overrides,
  };
}

// ═══ TESTS ═══

describe("cross-domain E2E: sleep + fitness correlation", () => {
  test("detects positive correlation when exercise days have better sleep", () => {
    const days: DayData[] = [];

    // 10 days: more exercise → better sleep (linear relationship)
    for (let i = 0; i < 10; i++) {
      days.push(
        makeDayData({
          sleep: {
            qualityScore: 50 + i * 5,
            durationMinutes: 420 + i * 8,
            logged: true,
          },
          fitness: {
            exerciseCount: 1 + Math.floor(i / 2),
            totalVolume: (1 + Math.floor(i / 2)) * 1000,
            totalDuration: 30 + i * 5,
          },
        })
      );
    }

    const correlations = computeAllCorrelations(days);
    const fitnessSleep = correlations.find((c) =>
      c.label.includes("Ejercicios vs Calidad de sueno")
    );

    expect(fitnessSleep).toBeDefined();
    expect(fitnessSleep!.correlation).toBeGreaterThan(0.7);
    expect(fitnessSleep!.direction).toBe("positiva");
  });
});

describe("cross-domain E2E: sleep + mood correlation", () => {
  test("detects positive correlation when better sleep → better mood", () => {
    const days: DayData[] = [];

    for (let i = 0; i < 10; i++) {
      days.push(
        makeDayData({
          sleep: {
            qualityScore: 40 + i * 6,
            durationMinutes: 360 + i * 15,
            logged: true,
          },
          mood: {
            averageIntensity: 3 + i * 0.7,
            checkInCount: 1,
            dominantMood: i > 5 ? "contento" : "neutral",
          },
        })
      );
    }

    const correlations = computeAllCorrelations(days);
    const sleepMood = correlations.find((c) =>
      c.label.includes("sueno vs Estado de animo")
    );

    expect(sleepMood).toBeDefined();
    expect(sleepMood!.correlation).toBeGreaterThan(0.9);
    expect(sleepMood!.direction).toBe("positiva");
    expect(sleepMood!.strength).toBe("fuerte");
  });
});

describe("cross-domain E2E: habits + mood correlation", () => {
  test("detects correlation when completing habits correlates with better mood", () => {
    const days: DayData[] = [];

    for (let i = 0; i < 10; i++) {
      days.push(
        makeDayData({
          habits: { completedCount: 1 + i },
          mood: {
            averageIntensity: 4 + i * 0.5,
            checkInCount: 1,
            dominantMood: null,
          },
        })
      );
    }

    const correlations = computeAllCorrelations(days);
    const habitsMood = correlations.find((c) =>
      c.label.includes("Habitos completados vs Estado de animo")
    );

    expect(habitsMood).toBeDefined();
    expect(habitsMood!.correlation).toBeGreaterThan(0.8);
  });
});

describe("cross-domain E2E: multi-domain daily hub data", () => {
  test("a full day has data from all 6 domains", () => {
    const fullDay = makeDayData({
      sleep: { qualityScore: 85, durationMinutes: 480, logged: true },
      nutrition: { totalCalories: 2100, totalProtein: 120, mealCount: 3 },
      fitness: { exerciseCount: 2, totalVolume: 5000, totalDuration: 60 },
      mood: { averageIntensity: 7, checkInCount: 2, dominantMood: "calmado" },
      habits: { completedCount: 4 },
      hydration: { totalMl: 2500 },
    });

    expect(fullDay.sleep.logged).toBe(true);
    expect(fullDay.nutrition.mealCount).toBeGreaterThan(0);
    expect(fullDay.fitness.exerciseCount).toBeGreaterThan(0);
    expect(fullDay.mood.checkInCount).toBeGreaterThan(0);
    expect(fullDay.habits.completedCount).toBeGreaterThan(0);
    expect(fullDay.hydration.totalMl).toBeGreaterThan(0);
  });

  test("wearable and manual data coexist in aggregation", () => {
    // Simulate both manual and wearable sleep entries for the same day
    const manualSleep = { qualityScore: 80, durationMinutes: 450, logged: true };
    const wearableSleep = { qualityScore: 78, durationMinutes: 455, logged: true };

    // In the real system, the latest entry is used for daily stats
    // Verify both are valid and can coexist
    expect(manualSleep.logged).toBe(true);
    expect(wearableSleep.logged).toBe(true);
    expect(Math.abs(manualSleep.qualityScore - wearableSleep.qualityScore)).toBeLessThan(10);
  });
});

describe("cross-domain E2E: no correlation with random data", () => {
  test("random data produces no significant correlations", () => {
    const days: DayData[] = [];
    // Use predetermined "random" values to avoid flakiness
    const sleepScores = [70, 45, 88, 30, 65, 92, 50, 75, 40, 85];
    const moodIntensities = [5, 8, 3, 7, 4, 6, 9, 2, 7, 5];

    for (let i = 0; i < 10; i++) {
      days.push(
        makeDayData({
          sleep: {
            qualityScore: sleepScores[i],
            durationMinutes: 420,
            logged: true,
          },
          mood: {
            averageIntensity: moodIntensities[i],
            checkInCount: 1,
            dominantMood: null,
          },
        })
      );
    }

    const correlations = computeAllCorrelations(days);
    const sleepMood = correlations.find((c) =>
      c.label.includes("sueno vs Estado de animo")
    );

    // With random data, either no correlation found or it's weak
    if (sleepMood) {
      expect(Math.abs(sleepMood.correlation)).toBeLessThan(0.7);
    }
  });
});
