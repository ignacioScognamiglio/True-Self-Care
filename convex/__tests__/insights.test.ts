import { describe, test, expect } from "vitest";

// ═══ TYPES (mirrored from insights.ts) ═══

interface DayData {
  date: number;
  sleep: { qualityScore: number; durationMinutes: number; logged: boolean };
  nutrition: { totalCalories: number; totalProtein: number; mealCount: number };
  fitness: { exerciseCount: number; totalVolume: number; totalDuration: number };
  mood: { averageIntensity: number; checkInCount: number; dominantMood: string | null };
  habits: { completedCount: number };
  hydration: { totalMl: number };
}

interface CorrelationResult {
  metricA: string;
  metricB: string;
  label: string;
  correlation: number;
  strength: "fuerte" | "moderada" | "debil";
  direction: "positiva" | "negativa";
  dataPoints: number;
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

function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;
  const freq = new Map<string, number>();
  for (const item of arr) {
    freq.set(item, (freq.get(item) ?? 0) + 1);
  }
  let maxCount = 0;
  let maxItem = arr[0];
  for (const [item, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      maxItem = item;
    }
  }
  return maxItem;
}

function computeCorrelations(daysData: DayData[]): CorrelationResult[] {
  const pairs: {
    metricA: string;
    metricB: string;
    label: string;
    getA: (d: DayData) => number | null;
    getB: (d: DayData) => number | null;
  }[] = [
    {
      metricA: "sleep.qualityScore",
      metricB: "mood.averageIntensity",
      label: "Calidad de sueno vs Estado de animo",
      getA: (d) => (d.sleep.logged ? d.sleep.qualityScore : null),
      getB: (d) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
    {
      metricA: "sleep.durationMinutes",
      metricB: "fitness.totalVolume",
      label: "Duracion de sueno vs Volumen de ejercicio",
      getA: (d) => (d.sleep.logged ? d.sleep.durationMinutes : null),
      getB: (d) => (d.fitness.exerciseCount > 0 ? d.fitness.totalVolume : null),
    },
    {
      metricA: "fitness.exerciseCount",
      metricB: "sleep.qualityScore",
      label: "Ejercicios realizados vs Calidad de sueno",
      getA: (d) => (d.fitness.exerciseCount > 0 ? d.fitness.exerciseCount : null),
      getB: (d) => (d.sleep.logged ? d.sleep.qualityScore : null),
    },
    {
      metricA: "habits.completedCount",
      metricB: "mood.averageIntensity",
      label: "Habitos completados vs Estado de animo",
      getA: (d) => (d.habits.completedCount > 0 ? d.habits.completedCount : null),
      getB: (d) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
  ];

  const results: CorrelationResult[] = [];

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
      metricA: pair.metricA,
      metricB: pair.metricB,
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

describe("pearsonCorrelation", () => {
  test("retorna 1.0 para arrays identicos", () => {
    const x = [1, 2, 3, 4, 5, 6, 7];
    const y = [1, 2, 3, 4, 5, 6, 7];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(1.0, 2);
  });

  test("retorna -1.0 para arrays inversamente proporcionales", () => {
    const x = [1, 2, 3, 4, 5, 6, 7];
    const y = [7, 6, 5, 4, 3, 2, 1];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(-1.0, 2);
  });

  test("retorna ~0 para arrays sin correlacion", () => {
    const x = [1, 2, 3, 4, 5, 6, 7];
    const y = [4, 1, 7, 2, 6, 3, 5];
    const r = pearsonCorrelation(x, y);
    expect(Math.abs(r)).toBeLessThan(0.3);
  });

  test("retorna 0 con menos de 5 puntos", () => {
    expect(pearsonCorrelation([1, 2, 3, 4], [4, 3, 2, 1])).toBe(0);
  });

  test("retorna 0 con exactamente 0 puntos", () => {
    expect(pearsonCorrelation([], [])).toBe(0);
  });

  test("retorna 0 si todos los valores son iguales (denominador 0)", () => {
    expect(pearsonCorrelation([5, 5, 5, 5, 5], [1, 2, 3, 4, 5])).toBe(0);
  });

  test("correlacion fuerte positiva para datos lineales con ruido", () => {
    const x = [10, 20, 30, 40, 50, 60, 70];
    const y = [12, 18, 33, 38, 52, 58, 71];
    const r = pearsonCorrelation(x, y);
    expect(r).toBeGreaterThan(0.95);
  });

  test("exactamente 5 puntos funciona correctamente", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(1.0, 2);
  });
});

describe("getStrength", () => {
  test("0.7+ es fuerte", () => {
    expect(getStrength(0.7)).toBe("fuerte");
    expect(getStrength(0.9)).toBe("fuerte");
    expect(getStrength(-0.8)).toBe("fuerte");
  });

  test("0.5-0.69 es moderada", () => {
    expect(getStrength(0.5)).toBe("moderada");
    expect(getStrength(0.69)).toBe("moderada");
    expect(getStrength(-0.6)).toBe("moderada");
  });

  test("<0.5 es debil", () => {
    expect(getStrength(0.3)).toBe("debil");
    expect(getStrength(0.1)).toBe("debil");
    expect(getStrength(-0.4)).toBe("debil");
  });
});

describe("getMostFrequent", () => {
  test("retorna null para array vacio", () => {
    expect(getMostFrequent([])).toBeNull();
  });

  test("retorna el mas frecuente", () => {
    expect(getMostFrequent(["a", "b", "a", "c", "a"])).toBe("a");
  });

  test("retorna primero encontrado en empate", () => {
    const result = getMostFrequent(["a", "b"]);
    expect(["a", "b"]).toContain(result);
  });

  test("un solo elemento", () => {
    expect(getMostFrequent(["unico"])).toBe("unico");
  });
});

describe("computeCorrelations", () => {
  test("detecta correlacion positiva entre sueno y animo", () => {
    const days: DayData[] = [];
    for (let i = 0; i < 7; i++) {
      const score = 50 + i * 8; // 50, 58, 66, 74, 82, 90, 98
      const mood = 4 + i * 0.8; // 4, 4.8, 5.6, 6.4, 7.2, 8.0, 8.8
      days.push(
        makeDayData({
          sleep: { qualityScore: score, durationMinutes: 420 + i * 10, logged: true },
          mood: { averageIntensity: mood, checkInCount: 1, dominantMood: "bien" },
        })
      );
    }

    const results = computeCorrelations(days);
    const sleepMood = results.find(
      (r) => r.metricA === "sleep.qualityScore" && r.metricB === "mood.averageIntensity"
    );

    expect(sleepMood).toBeDefined();
    expect(sleepMood!.correlation).toBeGreaterThan(0.9);
    expect(sleepMood!.direction).toBe("positiva");
    expect(sleepMood!.strength).toBe("fuerte");
  });

  test("no retorna correlaciones debiles (|r| <= 0.3)", () => {
    const days: DayData[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        makeDayData({
          sleep: { qualityScore: [80, 40, 90, 30, 70, 50, 60][i], durationMinutes: 480, logged: true },
          mood: { averageIntensity: [5, 7, 3, 8, 4, 6, 5][i], checkInCount: 1, dominantMood: null },
        })
      );
    }

    const results = computeCorrelations(days);
    for (const r of results) {
      expect(Math.abs(r.correlation)).toBeGreaterThan(0.3);
    }
  });

  test("requiere al menos 5 data points para cada par", () => {
    const days: DayData[] = [];
    // Only 3 days with both sleep and mood data
    for (let i = 0; i < 3; i++) {
      days.push(
        makeDayData({
          sleep: { qualityScore: 80 + i * 5, durationMinutes: 480, logged: true },
          mood: { averageIntensity: 7 + i, checkInCount: 1, dominantMood: null },
        })
      );
    }
    // 4 more days with only sleep
    for (let i = 0; i < 4; i++) {
      days.push(
        makeDayData({
          sleep: { qualityScore: 60, durationMinutes: 480, logged: true },
        })
      );
    }

    const results = computeCorrelations(days);
    const sleepMood = results.find(
      (r) => r.metricA === "sleep.qualityScore" && r.metricB === "mood.averageIntensity"
    );
    expect(sleepMood).toBeUndefined();
  });

  test("detecta correlacion entre ejercicio y calidad de sueno", () => {
    const days: DayData[] = [];
    // All 10 days have both exercise and sleep data with correlated values
    for (let i = 0; i < 10; i++) {
      const exercises = 1 + i; // 1, 2, 3, ..., 10
      const sleepScore = 40 + i * 6; // 40, 46, 52, ..., 94
      days.push(
        makeDayData({
          sleep: { qualityScore: sleepScore, durationMinutes: 420 + i * 10, logged: true },
          fitness: {
            exerciseCount: exercises,
            totalVolume: exercises * 1000,
            totalDuration: exercises * 30,
          },
        })
      );
    }

    const results = computeCorrelations(days);
    const fitnessSleep = results.find(
      (r) => r.metricA === "fitness.exerciseCount" && r.metricB === "sleep.qualityScore"
    );

    expect(fitnessSleep).toBeDefined();
    expect(fitnessSleep!.correlation).toBeGreaterThan(0.5);
  });

  test("resultados ordenados por |correlation| descendente", () => {
    const days: DayData[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        makeDayData({
          sleep: { qualityScore: 50 + i * 8, durationMinutes: 420 + i * 10, logged: true },
          mood: { averageIntensity: 4 + i * 0.8, checkInCount: 1, dominantMood: null },
          fitness: { exerciseCount: 1 + i, totalVolume: 1000 + i * 200, totalDuration: 30 + i * 5 },
          habits: { completedCount: 1 + i },
        })
      );
    }

    const results = computeCorrelations(days);
    for (let i = 1; i < results.length; i++) {
      expect(Math.abs(results[i - 1].correlation)).toBeGreaterThanOrEqual(
        Math.abs(results[i].correlation)
      );
    }
  });

  test("datos vacios retorna array vacio", () => {
    expect(computeCorrelations([])).toHaveLength(0);
  });
});
