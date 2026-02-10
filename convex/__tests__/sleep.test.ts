import { describe, test, expect } from "vitest";

// ═══ TYPES ═══

interface SleepData {
  bedTime: string;
  wakeTime: string;
  quality: number;
  durationMinutes: number;
  interruptions?: number;
  factors?: string[];
  notes?: string;
  dreamNotes?: string;
}

// ═══ PURE FUNCTIONS (mirrored from sleep.ts) ═══

function calculateQualityScore(sleep: {
  durationMinutes: number;
  quality: number;
  interruptions?: number;
}): number {
  let score = 0;
  const hours = sleep.durationMinutes / 60;

  if (hours >= 7 && hours <= 9) score += 40;
  else if (hours >= 6 && hours < 7) score += 30;
  else if (hours > 9 && hours <= 10) score += 30;
  else if (hours >= 5 && hours < 6) score += 15;
  else score += 5;

  score += sleep.quality * 6;

  const interruptionPenalty = Math.min(sleep.interruptions ?? 0, 4);
  score += Math.max(5, 20 - interruptionPenalty * 5);

  score += 10;

  return Math.min(100, Math.max(0, score));
}

function calculateDurationMinutes(bedTime: string, wakeTime: string): number {
  const [bedH, bedM] = bedTime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);

  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return wakeMinutes - bedMinutes;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function calculateAverageTime(times: string[]): string {
  if (times.length === 0) return "00:00";
  let totalMinutes = 0;
  for (const time of times) {
    const [h, m] = time.split(":").map(Number);
    let mins = h * 60 + m;
    if (h < 6) mins += 24 * 60;
    totalMinutes += mins;
  }
  let avgMinutes = Math.round(totalMinutes / times.length);
  avgMinutes = avgMinutes % (24 * 60);
  const avgH = Math.floor(avgMinutes / 60);
  const avgM = avgMinutes % 60;
  return `${String(avgH).padStart(2, "0")}:${String(avgM).padStart(2, "0")}`;
}

// ═══ TESTS ═══

describe("calculateQualityScore", () => {
  test("7-9h sin interrupciones, calidad 5 = score alto (>=80)", () => {
    const score = calculateQualityScore({
      durationMinutes: 480,
      quality: 5,
      interruptions: 0,
    });
    expect(score).toBe(100);
  });

  test("7h exactas, calidad 4, 1 interrupcion = score bueno", () => {
    const score = calculateQualityScore({
      durationMinutes: 420,
      quality: 4,
      interruptions: 1,
    });
    expect(score).toBe(89);
  });

  test("6h, calidad 3, 2 interrupciones = score medio", () => {
    const score = calculateQualityScore({
      durationMinutes: 360,
      quality: 3,
      interruptions: 2,
    });
    expect(score).toBe(68);
  });

  test("5h, calidad 2, 3 interrupciones = score bajo", () => {
    const score = calculateQualityScore({
      durationMinutes: 300,
      quality: 2,
      interruptions: 3,
    });
    expect(score).toBe(42);
  });

  test("<5h, calidad 1, 4+ interrupciones = score muy bajo", () => {
    const score = calculateQualityScore({
      durationMinutes: 240,
      quality: 1,
      interruptions: 5,
    });
    expect(score).toBe(26);
  });

  test(">10h penaliza duracion", () => {
    const score = calculateQualityScore({
      durationMinutes: 660,
      quality: 5,
      interruptions: 0,
    });
    expect(score).toBe(65);
  });

  test("9-10h tiene penalizacion leve", () => {
    const score = calculateQualityScore({
      durationMinutes: 570,
      quality: 4,
      interruptions: 0,
    });
    expect(score).toBe(84);
  });

  test("interrupciones undefined se tratan como 0", () => {
    const score = calculateQualityScore({
      durationMinutes: 480,
      quality: 5,
    });
    expect(score).toBe(100);
  });

  test("score nunca excede 100", () => {
    const score = calculateQualityScore({
      durationMinutes: 480,
      quality: 5,
      interruptions: 0,
    });
    expect(score).toBeLessThanOrEqual(100);
  });

  test("score nunca es menor que 0", () => {
    const score = calculateQualityScore({
      durationMinutes: 60,
      quality: 1,
      interruptions: 10,
    });
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateDurationMinutes", () => {
  test("sueno que no cruza medianoche: 22:00 -> 06:00 = 480min", () => {
    expect(calculateDurationMinutes("22:00", "06:00")).toBe(480);
  });

  test("sueno que cruza medianoche: 23:30 -> 07:15 = 465min", () => {
    expect(calculateDurationMinutes("23:30", "07:15")).toBe(465);
  });

  test("sueno corto antes de medianoche: 22:00 -> 23:30 = 90min", () => {
    expect(calculateDurationMinutes("22:00", "23:30")).toBe(90);
  });

  test("sueno que empieza despues de medianoche: 01:00 -> 08:00 = 420min", () => {
    expect(calculateDurationMinutes("01:00", "08:00")).toBe(420);
  });

  test("medianoche exacta: 00:00 -> 07:00 = 420min", () => {
    expect(calculateDurationMinutes("00:00", "07:00")).toBe(420);
  });

  test("23:00 -> 07:00 = 480min (8 horas)", () => {
    expect(calculateDurationMinutes("23:00", "07:00")).toBe(480);
  });
});

describe("formatDuration", () => {
  test("465 minutos = '7h 45min'", () => {
    expect(formatDuration(465)).toBe("7h 45min");
  });

  test("480 minutos = '8h'", () => {
    expect(formatDuration(480)).toBe("8h");
  });

  test("45 minutos = '45min'", () => {
    expect(formatDuration(45)).toBe("45min");
  });

  test("0 minutos = '0min'", () => {
    expect(formatDuration(0)).toBe("0min");
  });
});

describe("calculateAverageTime", () => {
  test("promedio de horarios nocturnos: 23:00, 23:30, 00:00", () => {
    const avg = calculateAverageTime(["23:00", "23:30", "00:00"]);
    expect(avg).toBe("23:30");
  });

  test("promedio de horarios matutinos: 07:00, 07:30, 08:00", () => {
    const avg = calculateAverageTime(["07:00", "07:30", "08:00"]);
    expect(avg).toBe("07:30");
  });

  test("array vacio retorna 00:00", () => {
    expect(calculateAverageTime([])).toBe("00:00");
  });

  test("un solo horario retorna ese horario", () => {
    expect(calculateAverageTime(["22:15"])).toBe("22:15");
  });
});

describe("calcSleepStats", () => {
  function calcSleepStats(entries: Array<{
    timestamp: number;
    data: SleepData;
  }>) {
    if (entries.length === 0) {
      return {
        averageDuration: 0,
        averageQualityScore: 0,
        averageBedTime: "00:00",
        averageWakeTime: "00:00",
        bestNight: null,
        worstNight: null,
        totalNightsLogged: 0,
        consistencyScore: 0,
        commonFactors: [],
      };
    }

    let totalDuration = 0;
    let totalScore = 0;
    const bedTimes: string[] = [];
    const wakeTimes: string[] = [];
    let best: { date: number; qualityScore: number } | null = null;
    let worst: { date: number; qualityScore: number } | null = null;
    const factorCounts = new Map<string, number>();

    for (const entry of entries) {
      const d = entry.data;
      totalDuration += d.durationMinutes;
      const qs = d.qualityScore ?? calculateQualityScore(d);
      totalScore += qs;
      bedTimes.push(d.bedTime);
      wakeTimes.push(d.wakeTime);

      if (!best || qs > best.qualityScore) {
        best = { date: entry.timestamp, qualityScore: qs };
      }
      if (!worst || qs < worst.qualityScore) {
        worst = { date: entry.timestamp, qualityScore: qs };
      }

      for (const factor of d.factors ?? []) {
        factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
      }
    }

    const commonFactors = Array.from(factorCounts.entries())
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count);

    return {
      averageDuration: Math.round(totalDuration / entries.length),
      averageQualityScore: Math.round(totalScore / entries.length),
      averageBedTime: calculateAverageTime(bedTimes),
      averageWakeTime: calculateAverageTime(wakeTimes),
      bestNight: best,
      worstNight: worst,
      totalNightsLogged: entries.length,
      consistencyScore: 0,
      commonFactors,
    };
  }

  test("stats con multiples noches", () => {
    const now = Date.now();
    const stats = calcSleepStats([
      {
        timestamp: now - 86400000 * 2,
        data: {
          bedTime: "23:00", wakeTime: "07:00", quality: 4,
          durationMinutes: 480, qualityScore: 89,
          factors: ["meditacion"],
        } as SleepData,
      },
      {
        timestamp: now - 86400000,
        data: {
          bedTime: "23:30", wakeTime: "06:30", quality: 3,
          durationMinutes: 420, qualityScore: 68,
          factors: ["estres", "pantallas"],
        } as SleepData,
      },
      {
        timestamp: now,
        data: {
          bedTime: "23:00", wakeTime: "07:30", quality: 5,
          durationMinutes: 510, qualityScore: 100,
          factors: ["meditacion"],
        } as SleepData,
      },
    ]);

    expect(stats.totalNightsLogged).toBe(3);
    expect(stats.averageDuration).toBe(470);
    expect(stats.averageQualityScore).toBe(86);
    expect(stats.bestNight?.qualityScore).toBe(100);
    expect(stats.worstNight?.qualityScore).toBe(68);
    expect(stats.commonFactors[0].factor).toBe("meditacion");
    expect(stats.commonFactors[0].count).toBe(2);
  });

  test("stats sin datos retorna ceros", () => {
    const stats = calcSleepStats([]);
    expect(stats.totalNightsLogged).toBe(0);
    expect(stats.averageDuration).toBe(0);
    expect(stats.averageQualityScore).toBe(0);
    expect(stats.bestNight).toBeNull();
    expect(stats.worstNight).toBeNull();
    expect(stats.commonFactors).toHaveLength(0);
  });

  test("stats con una sola noche", () => {
    const now = Date.now();
    const stats = calcSleepStats([
      {
        timestamp: now,
        data: {
          bedTime: "22:30", wakeTime: "06:30", quality: 4,
          durationMinutes: 480, qualityScore: 89,
        } as SleepData,
      },
    ]);

    expect(stats.totalNightsLogged).toBe(1);
    expect(stats.averageDuration).toBe(480);
    expect(stats.bestNight?.qualityScore).toBe(89);
    expect(stats.worstNight?.qualityScore).toBe(89);
  });
});
