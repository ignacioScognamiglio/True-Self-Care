import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  internalAction,
} from "../_generated/server";
import { startOfDay } from "date-fns";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";
import { internal } from "../_generated/api";
import { generateText } from "ai";
import { getModelForTask, persistTokenUsage } from "../lib/modelConfig";
import { Id } from "../_generated/dataModel";

// ═══ TYPES ═══

interface DayData {
  date: number;
  sleep: {
    qualityScore: number;
    durationMinutes: number;
    logged: boolean;
  };
  nutrition: {
    totalCalories: number;
    totalProtein: number;
    mealCount: number;
  };
  fitness: {
    exerciseCount: number;
    totalVolume: number;
    totalDuration: number;
  };
  mood: {
    averageIntensity: number;
    checkInCount: number;
    dominantMood: string | null;
  };
  habits: {
    completedCount: number;
  };
  hydration: {
    totalMl: number;
  };
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

// ═══ HELPERS ═══

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

function calculateSleepQualityScore(sleep: {
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

function calculateSleepDuration(bedTime: string, wakeTime: string): number {
  const [bedH, bedM] = bedTime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);
  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }
  return wakeMinutes - bedMinutes;
}

async function fetchCrossDomainData(
  ctx: { db: any },
  userId: Id<"users">,
  days: number
): Promise<{ days: DayData[]; period: { start: number; end: number; totalDays: number } }> {
  const now = Date.now();
  const startTime = now - days * 24 * 60 * 60 * 1000;

  const entries = await ctx.db
    .query("wellnessEntries")
    .withIndex("by_user_time", (q: any) =>
      q.eq("userId", userId).gte("timestamp", startTime)
    )
    .collect();

  // Group entries by day
  const dailyMap = new Map<number, Map<string, any[]>>();

  for (const entry of entries) {
    const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, new Map());
    }
    const dayEntries = dailyMap.get(dayKey)!;
    if (!dayEntries.has(entry.type)) {
      dayEntries.set(entry.type, []);
    }
    dayEntries.get(entry.type)!.push(entry);
  }

  // Build structured day array
  const result: DayData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayTimestamp = startOfDay(
      new Date(now - i * 24 * 60 * 60 * 1000)
    ).getTime();
    const dayEntries = dailyMap.get(dayTimestamp);

    // Sleep
    const sleepEntries = dayEntries?.get("sleep") ?? [];
    let sleepData = { qualityScore: 0, durationMinutes: 0, logged: false };
    if (sleepEntries.length > 0) {
      const latest = sleepEntries[sleepEntries.length - 1].data as any;
      const durationMinutes =
        latest.bedTime && latest.wakeTime
          ? calculateSleepDuration(latest.bedTime, latest.wakeTime)
          : 0;
      const qualityScore = calculateSleepQualityScore({
        durationMinutes,
        quality: latest.quality ?? 3,
        interruptions: latest.interruptions,
      });
      sleepData = { qualityScore, durationMinutes, logged: true };
    }

    // Nutrition
    const nutritionEntries = dayEntries?.get("nutrition") ?? [];
    let totalCalories = 0;
    let totalProtein = 0;
    for (const entry of nutritionEntries) {
      const data = entry.data as any;
      totalCalories += data.calories ?? 0;
      totalProtein += data.protein ?? 0;
    }

    // Fitness
    const fitnessEntries = dayEntries?.get("exercise") ?? [];
    let totalVolume = 0;
    let totalDuration = 0;
    for (const entry of fitnessEntries) {
      const data = entry.data as any;
      totalVolume += (data.sets ?? 0) * (data.reps ?? 0) * (data.weight ?? 0);
      totalDuration += data.durationMinutes ?? data.duration ?? 0;
    }

    // Mood
    const moodEntries = dayEntries?.get("mood") ?? [];
    let moodTotal = 0;
    const moods: string[] = [];
    for (const entry of moodEntries) {
      const data = entry.data as any;
      moodTotal += data.intensity ?? 0;
      if (data.mood) moods.push(data.mood);
    }

    // Habits
    const habitEntries = dayEntries?.get("habit") ?? [];

    // Hydration
    const waterEntries = dayEntries?.get("water") ?? [];
    let totalMl = 0;
    for (const entry of waterEntries) {
      const data = entry.data as any;
      totalMl += data.amount ?? data.ml ?? 0;
    }

    result.push({
      date: dayTimestamp,
      sleep: sleepData,
      nutrition: {
        totalCalories,
        totalProtein,
        mealCount: nutritionEntries.length,
      },
      fitness: {
        exerciseCount: fitnessEntries.length,
        totalVolume,
        totalDuration,
      },
      mood: {
        averageIntensity:
          moodEntries.length > 0
            ? Math.round((moodTotal / moodEntries.length) * 10) / 10
            : 0,
        checkInCount: moodEntries.length,
        dominantMood: moods.length > 0 ? getMostFrequent(moods) : null,
      },
      habits: {
        completedCount: habitEntries.length,
      },
      hydration: {
        totalMl,
      },
    });
  }

  return {
    days: result,
    period: {
      start: startTime,
      end: now,
      totalDays: days,
    },
  };
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
      metricA: "sleep.qualityScore",
      metricB: "nutrition.totalCalories",
      label: "Calidad de sueno vs Calorias consumidas",
      getA: (d) => (d.sleep.logged ? d.sleep.qualityScore : null),
      getB: (d) => (d.nutrition.mealCount > 0 ? d.nutrition.totalCalories : null),
    },
    {
      metricA: "sleep.qualityScore",
      metricB: "hydration.totalMl",
      label: "Calidad de sueno vs Hidratacion",
      getA: (d) => (d.sleep.logged ? d.sleep.qualityScore : null),
      getB: (d) => (d.hydration.totalMl > 0 ? d.hydration.totalMl : null),
    },
    {
      metricA: "fitness.exerciseCount",
      metricB: "mood.averageIntensity",
      label: "Ejercicios realizados vs Estado de animo",
      getA: (d) => (d.fitness.exerciseCount > 0 ? d.fitness.exerciseCount : null),
      getB: (d) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
    {
      metricA: "fitness.exerciseCount",
      metricB: "sleep.qualityScore",
      label: "Ejercicios realizados vs Calidad de sueno",
      getA: (d) => (d.fitness.exerciseCount > 0 ? d.fitness.exerciseCount : null),
      getB: (d) => (d.sleep.logged ? d.sleep.qualityScore : null),
    },
    {
      metricA: "nutrition.mealCount",
      metricB: "mood.averageIntensity",
      label: "Comidas registradas vs Estado de animo",
      getA: (d) => (d.nutrition.mealCount > 0 ? d.nutrition.mealCount : null),
      getB: (d) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
    {
      metricA: "nutrition.totalProtein",
      metricB: "fitness.totalVolume",
      label: "Proteina consumida vs Volumen de ejercicio",
      getA: (d) => (d.nutrition.mealCount > 0 ? d.nutrition.totalProtein : null),
      getB: (d) => (d.fitness.exerciseCount > 0 ? d.fitness.totalVolume : null),
    },
    {
      metricA: "habits.completedCount",
      metricB: "mood.averageIntensity",
      label: "Habitos completados vs Estado de animo",
      getA: (d) => (d.habits.completedCount > 0 ? d.habits.completedCount : null),
      getB: (d) => (d.mood.checkInCount > 0 ? d.mood.averageIntensity : null),
    },
    {
      metricA: "habits.completedCount",
      metricB: "sleep.qualityScore",
      label: "Habitos completados vs Calidad de sueno",
      getA: (d) => (d.habits.completedCount > 0 ? d.habits.completedCount : null),
      getB: (d) => (d.sleep.logged ? d.sleep.qualityScore : null),
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

// ═══ INTERNAL QUERIES ═══

export const gatherCrossDomainData = internalQuery({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numDays = args.days ?? 7;
    return await fetchCrossDomainData(ctx, args.userId, numDays);
  },
});

export const calculateCorrelations = internalQuery({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numDays = args.days ?? 30;
    const data = await fetchCrossDomainData(ctx, args.userId, numDays);
    return computeCorrelations(data.days);
  },
});

// ═══ INTERNAL ACTION ═══

export const generateInsights = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const crossDomainData = await ctx.runQuery(
      internal.functions.insights.gatherCrossDomainData,
      { userId: args.userId, days: 30 }
    );

    const correlations = await ctx.runQuery(
      internal.functions.insights.calculateCorrelations,
      { userId: args.userId, days: 30 }
    );

    const daysData = (crossDomainData as any).days as DayData[];
    const correlationsData = correlations as CorrelationResult[];

    // Check if we have enough data
    const activeDays = daysData.filter(
      (d) =>
        d.sleep.logged ||
        d.nutrition.mealCount > 0 ||
        d.fitness.exerciseCount > 0 ||
        d.mood.checkInCount > 0 ||
        d.habits.completedCount > 0 ||
        d.hydration.totalMl > 0
    );

    if (activeDays.length < 5) {
      return;
    }

    // Build summary for LLM
    const summary = {
      totalActiveDays: activeDays.length,
      sleepDaysLogged: daysData.filter((d) => d.sleep.logged).length,
      avgSleepScore:
        daysData.filter((d) => d.sleep.logged).length > 0
          ? Math.round(
              daysData
                .filter((d) => d.sleep.logged)
                .reduce((sum, d) => sum + d.sleep.qualityScore, 0) /
                daysData.filter((d) => d.sleep.logged).length
            )
          : null,
      avgSleepDuration:
        daysData.filter((d) => d.sleep.logged).length > 0
          ? Math.round(
              daysData
                .filter((d) => d.sleep.logged)
                .reduce((sum, d) => sum + d.sleep.durationMinutes, 0) /
                daysData.filter((d) => d.sleep.logged).length
            )
          : null,
      nutritionDays: daysData.filter((d) => d.nutrition.mealCount > 0).length,
      avgCalories:
        daysData.filter((d) => d.nutrition.mealCount > 0).length > 0
          ? Math.round(
              daysData
                .filter((d) => d.nutrition.mealCount > 0)
                .reduce((sum, d) => sum + d.nutrition.totalCalories, 0) /
                daysData.filter((d) => d.nutrition.mealCount > 0).length
            )
          : null,
      fitnessDays: daysData.filter((d) => d.fitness.exerciseCount > 0).length,
      avgExercises:
        daysData.filter((d) => d.fitness.exerciseCount > 0).length > 0
          ? Math.round(
              (daysData
                .filter((d) => d.fitness.exerciseCount > 0)
                .reduce((sum, d) => sum + d.fitness.exerciseCount, 0) /
                daysData.filter((d) => d.fitness.exerciseCount > 0).length) *
                10
            ) / 10
          : null,
      moodDays: daysData.filter((d) => d.mood.checkInCount > 0).length,
      avgMoodIntensity:
        daysData.filter((d) => d.mood.checkInCount > 0).length > 0
          ? Math.round(
              (daysData
                .filter((d) => d.mood.checkInCount > 0)
                .reduce((sum, d) => sum + d.mood.averageIntensity, 0) /
                daysData.filter((d) => d.mood.checkInCount > 0).length) *
                10
            ) / 10
          : null,
      habitDays: daysData.filter((d) => d.habits.completedCount > 0).length,
      hydrationDays: daysData.filter((d) => d.hydration.totalMl > 0).length,
      avgHydration:
        daysData.filter((d) => d.hydration.totalMl > 0).length > 0
          ? Math.round(
              daysData
                .filter((d) => d.hydration.totalMl > 0)
                .reduce((sum, d) => sum + d.hydration.totalMl, 0) /
                daysData.filter((d) => d.hydration.totalMl > 0).length
            )
          : null,
    };

    const correlationText =
      correlationsData.length > 0
        ? correlationsData
            .map(
              (c) =>
                `- ${c.label}: r=${c.correlation} (${c.strength}, ${c.direction}, ${c.dataPoints} datos)`
            )
            .join("\n")
        : "No se encontraron correlaciones significativas.";

    const prompt = `Eres un analista de bienestar personal. Analiza los datos de los ultimos 30 dias del usuario y genera entre 3 y 5 insights accionables en espanol.

## Resumen de datos (30 dias)
- Dias activos: ${summary.totalActiveDays}
- Sueno: ${summary.sleepDaysLogged} noches registradas${summary.avgSleepScore !== null ? `, score promedio ${summary.avgSleepScore}/100` : ""}${summary.avgSleepDuration !== null ? `, duracion promedio ${Math.floor(summary.avgSleepDuration / 60)}h ${summary.avgSleepDuration % 60}min` : ""}
- Nutricion: ${summary.nutritionDays} dias registrados${summary.avgCalories !== null ? `, ${summary.avgCalories} kcal promedio` : ""}
- Fitness: ${summary.fitnessDays} dias con ejercicio${summary.avgExercises !== null ? `, ${summary.avgExercises} ejercicios promedio/dia` : ""}
- Animo: ${summary.moodDays} check-ins${summary.avgMoodIntensity !== null ? `, intensidad promedio ${summary.avgMoodIntensity}/10` : ""}
- Habitos: ${summary.habitDays} dias con habitos completados
- Hidratacion: ${summary.hydrationDays} dias registrados${summary.avgHydration !== null ? `, ${summary.avgHydration}ml promedio` : ""}

## Correlaciones encontradas
${correlationText}

## Instrucciones
Genera exactamente entre 3 y 5 insights. Cada insight debe:
1. Conectar al menos 2 dominios diferentes (sueno, nutricion, fitness, animo, habitos, hidratacion)
2. Ser accionable (dar una recomendacion concreta)
3. Basarse en los datos reales del usuario
4. Usar tono cercano y tutear al usuario

Responde en formato JSON (solo el array, sin markdown):
[
  {
    "title": "Titulo corto del insight (max 60 chars)",
    "body": "Explicacion del insight con recomendacion concreta (max 200 chars)",
    "actionUrl": "/dashboard/seccion-relevante"
  }
]`;

    try {
      const startTime = Date.now();
      const { text, usage, providerMetadata } = await generateText({
        model: getModelForTask("generate_insights"),
        prompt,
      });
      const googleMeta = (providerMetadata as any)?.google?.usageMetadata;
      await persistTokenUsage(ctx, {
        userId: args.userId,
        task: "generate_insights",
        model: "gemini-2.5-flash",
        inputTokens: usage?.inputTokens,
        outputTokens: usage?.outputTokens,
        cachedTokens: googleMeta?.cachedContentTokenCount,
        durationMs: Date.now() - startTime,
      });

      // Parse JSON from response
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const insights = JSON.parse(cleaned) as Array<{
        title: string;
        body: string;
        actionUrl?: string;
      }>;

      for (const insight of insights) {
        await ctx.runMutation(internal.functions.insights.saveInsight, {
          userId: args.userId,
          title: insight.title,
          body: insight.body,
          actionUrl: insight.actionUrl,
        });
      }
    } catch (error) {
      console.error("Error generating insights:", error);
    }
  },
});

// ═══ INTERNAL MUTATIONS ═══

export const saveInsight = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "cross_domain_insight",
      title: args.title,
      body: args.body,
      read: false,
      actionUrl: args.actionUrl,
      createdAt: Date.now(),
    });
  },
});

// ═══ PUBLIC QUERIES ═══

export const getRecentInsights = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const limit = args.limit ?? 20;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id)
      )
      .order("desc")
      .collect();

    return notifications
      .filter((n) => n.type === "cross_domain_insight")
      .slice(0, limit)
      .map((n) => ({
        _id: n._id,
        title: n.title,
        body: n.body,
        read: n.read,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt,
      }));
  },
});

// ═══ INTERNAL QUERIES (for tools) ═══

export const getRecentInsightsInternal = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", args.userId)
      )
      .order("desc")
      .collect();

    return notifications
      .filter((n) => n.type === "cross_domain_insight" && !n.read)
      .slice(0, limit)
      .map((n) => ({
        _id: n._id,
        title: n.title,
        body: n.body,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt,
      }));
  },
});

// ═══ PUBLIC QUERIES (for UI) ═══

export const getCorrelationsSummary = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const numDays = args.days ?? 30;
    const data = await fetchCrossDomainData(ctx, user._id, numDays);
    return computeCorrelations(data.days);
  },
});

// ═══ PUBLIC MUTATIONS ═══

export const dismissInsight = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== user._id) {
      throw new Error("Notificacion no encontrada");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});
