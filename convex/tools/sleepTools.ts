import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const logSleep = createTool({
  description:
    "Registra las horas de sueno del usuario con calidad",
  args: z.object({
    bedTime: z
      .string()
      .describe("Hora de acostarse en formato HH:MM (ej: 23:30)"),
    wakeTime: z
      .string()
      .describe("Hora de despertar en formato HH:MM (ej: 07:15)"),
    quality: z
      .number()
      .min(1)
      .max(5)
      .describe("Calidad del sueno del 1 al 5"),
    factors: z
      .array(z.string())
      .optional()
      .describe(
        "Factores que afectaron el sueno: estres, cafeina, alcohol, pantallas, ejercicio_tarde, comida_pesada, ruido, temperatura, dolor, medicacion, meditacion, lectura, musica_relajante"
      ),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.sleep.logSleepEntry, {
      userId,
      sleep: {
        bedTime: args.bedTime,
        wakeTime: args.wakeTime,
        quality: args.quality,
        factors: args.factors,
      },
    });

    // Calculate duration for response
    const [bh, bm] = args.bedTime.split(":").map(Number);
    const [wh, wm] = args.wakeTime.split(":").map(Number);
    let bedMinutes = bh * 60 + bm;
    const wakeMinutes = wh * 60 + wm;
    if (bedMinutes > wakeMinutes) bedMinutes -= 24 * 60;
    const durationMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationFormatted = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;

    return `Sueno registrado: ${args.bedTime} → ${args.wakeTime} (${durationFormatted}), calidad ${args.quality}/5`;
  },
});

export const getSleepSummary = createTool({
  description:
    "Obtiene el resumen de sueno del usuario para hoy (la noche anterior)",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const summary = (await ctx.runQuery(
      internal.functions.sleep.getTodaySleepSummary,
      { userId }
    )) as any;

    if (!summary || !summary.hasLoggedSleep) {
      return "No hay registro de sueno de anoche.";
    }

    return `Sueno de anoche: ${summary.bedTime} → ${summary.wakeTime} (${summary.durationFormatted}), calidad ${summary.quality}/5, score ${summary.qualityScore}/100${summary.interruptions > 0 ? `, ${summary.interruptions} interrupciones` : ""}`;
  },
});

export const getSleepHistory = createTool({
  description:
    "Obtiene el historial de sueno del usuario de los ultimos dias",
  args: z.object({
    days: z
      .number()
      .optional()
      .describe("Numero de dias de historial (default 7)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const history = (await ctx.runQuery(
      internal.functions.sleep.getSleepHistoryInternal,
      { userId, days: args.days }
    )) as any[];

    const logged = history.filter((d) => d.bedTime !== null);
    if (logged.length === 0) {
      return `No hay registros de sueno en los ultimos ${args.days ?? 7} dias.`;
    }

    const lines = logged
      .map((d) => {
        const date = new Date(d.date).toLocaleDateString("es");
        const hours = Math.floor(d.durationMinutes / 60);
        const mins = d.durationMinutes % 60;
        const dur = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        return `- ${date}: ${d.bedTime} → ${d.wakeTime} (${dur}), calidad ${d.quality}/5, score ${d.qualityScore}/100`;
      })
      .join("\n");

    return `Historial de sueno (${args.days ?? 7} dias):\nNoches registradas: ${logged.length}\n\n${lines}`;
  },
});

export const getSleepStats = createTool({
  description:
    "Obtiene estadisticas de sueno del usuario (promedios, mejor/peor noche, factores comunes)",
  args: z.object({
    days: z
      .number()
      .optional()
      .describe("Numero de dias para estadisticas (default 30)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const stats = (await ctx.runQuery(
      internal.functions.sleep.getSleepStatsInternal,
      { userId, days: args.days }
    )) as any;

    if (stats.totalNightsLogged === 0) {
      return `No hay registros de sueno en los ultimos ${args.days ?? 30} dias.`;
    }

    const avgHours = Math.floor(stats.averageDuration / 60);
    const avgMins = stats.averageDuration % 60;
    const avgDur =
      avgMins > 0 ? `${avgHours}h ${avgMins}min` : `${avgHours}h`;

    let result = `Estadisticas de sueno (${args.days ?? 30} dias):
- Noches registradas: ${stats.totalNightsLogged}
- Duracion promedio: ${avgDur}
- Score promedio: ${stats.averageQualityScore}/100
- Hora promedio de dormir: ${stats.averageBedTime}
- Hora promedio de despertar: ${stats.averageWakeTime}
- Consistencia: ${stats.consistencyScore}%`;

    if (stats.bestNight) {
      result += `\n- Mejor noche: score ${stats.bestNight.qualityScore} (${new Date(stats.bestNight.date).toLocaleDateString("es")})`;
    }
    if (stats.worstNight) {
      result += `\n- Peor noche: score ${stats.worstNight.qualityScore} (${new Date(stats.worstNight.date).toLocaleDateString("es")})`;
    }
    if (stats.commonFactors.length > 0) {
      const top = stats.commonFactors
        .slice(0, 5)
        .map((f: any) => `${f.factor} (${f.count}x)`)
        .join(", ");
      result += `\n- Factores mas comunes: ${top}`;
    }

    return result;
  },
});

export const createSleepRoutine = createTool({
  description:
    "Crea una rutina de sueno personalizada para el usuario",
  args: z.object({
    targetBedTime: z
      .string()
      .describe("Hora objetivo de acostarse (HH:MM)"),
    targetWakeTime: z
      .string()
      .describe("Hora objetivo de despertar (HH:MM)"),
    concerns: z
      .array(z.string())
      .optional()
      .describe(
        "Preocupaciones principales: insomnio, despertarse_mucho, no_descansado, horarios_irregulares"
      ),
    preferences: z
      .array(z.string())
      .optional()
      .describe(
        "Preferencias para la rutina: meditacion, lectura, musica, infusiones, stretching"
      ),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;

    // Calculate wind-down start (30 min before bed)
    const [bh, bm] = args.targetBedTime.split(":").map(Number);
    let windDownH = bh;
    let windDownM = bm - 30;
    if (windDownM < 0) {
      windDownM += 60;
      windDownH -= 1;
      if (windDownH < 0) windDownH += 24;
    }
    const windDownTime = `${String(windDownH).padStart(2, "0")}:${String(windDownM).padStart(2, "0")}`;

    const steps = [
      {
        time: windDownTime,
        activity: "Apagar pantallas y preparar el ambiente (bajar luces, temperatura)",
        duration: 10,
        category: "sleep_hygiene",
      },
      {
        time: `${String(windDownH).padStart(2, "0")}:${String(windDownM + 10).padStart(2, "0")}`,
        activity:
          args.preferences?.includes("infusiones")
            ? "Preparar infusion relajante (tilo, manzanilla o valeriana)"
            : "Hacer stretching suave o respiracion profunda",
        duration: 10,
        category: "wind_down",
      },
      {
        time: `${String(windDownH).padStart(2, "0")}:${String(windDownM + 20).padStart(2, "0")}`,
        activity:
          args.preferences?.includes("meditacion")
            ? "Meditacion guiada de relajacion"
            : args.preferences?.includes("lectura")
              ? "Lectura relajante (libro fisico, no pantalla)"
              : "Relajacion progresiva muscular",
        duration: 10,
        category: "relaxation",
      },
    ];

    const tips = [
      "Mantene horarios consistentes, incluso los fines de semana",
      "Evita cafeina despues de las 14h",
      "Tu habitacion debe estar oscura, fresca (18-20°C) y silenciosa",
    ];

    if (args.concerns?.includes("insomnio")) {
      tips.push(
        "Si no te dormis en 20 min, levantate y hace algo tranquilo hasta sentir sueno"
      );
    }
    if (args.concerns?.includes("despertarse_mucho")) {
      tips.push(
        "Evita liquidos 2h antes de dormir para reducir despertares nocturnos"
      );
    }

    const routineContent = {
      title: "Rutina de sueno personalizada",
      goal: "Mejorar calidad de sueno con rutina consistente",
      targetBedTime: args.targetBedTime,
      targetWakeTime: args.targetWakeTime,
      windDownMinutes: 30,
      steps,
      tips,
      avoidFactors: [
        "Cafeina despues de las 14h",
        "Pantallas 1h antes de dormir",
        "Comidas pesadas 2-3h antes",
        "Ejercicio intenso 2-3h antes",
      ],
    };

    await ctx.runMutation(internal.functions.plans.createPlan, {
      userId,
      type: "sleep_routine",
      content: routineContent,
    });

    return `Rutina de sueno creada: wind-down a las ${windDownTime}, acostarse a las ${args.targetBedTime}, despertar a las ${args.targetWakeTime}. ${steps.length} pasos de preparacion. Podes verla en /dashboard/sleep.`;
  },
});

export const analyzeSleepFactors = createTool({
  description:
    "Analiza los factores que mas afectan la calidad de sueno del usuario basado en su historial",
  args: z.object({
    days: z
      .number()
      .optional()
      .describe("Numero de dias a analizar (default 30)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const history = (await ctx.runQuery(
      internal.functions.sleep.getSleepHistoryInternal,
      { userId, days: args.days ?? 30 }
    )) as any[];

    const logged = history.filter((d) => d.bedTime !== null);
    if (logged.length < 3) {
      return "Necesito al menos 3 noches registradas para analizar patrones. Segui registrando tu sueno.";
    }

    // Get full entries with factors
    const stats = (await ctx.runQuery(
      internal.functions.sleep.getSleepStatsInternal,
      { userId, days: args.days ?? 30 }
    )) as any;

    if (stats.commonFactors.length === 0) {
      return `Tenes ${logged.length} noches registradas pero sin factores reportados. Cuando registres sueno, inclui factores como estres, cafeina, pantallas, etc. para que pueda analizar patrones.`;
    }

    const avgScore = stats.averageQualityScore;
    const avgHours = Math.floor(stats.averageDuration / 60);
    const avgMins = stats.averageDuration % 60;
    const avgDur =
      avgMins > 0 ? `${avgHours}h ${avgMins}min` : `${avgHours}h`;

    const factors = stats.commonFactors
      .slice(0, 5)
      .map((f: any) => `- ${f.factor}: ${f.count} noches (${Math.round((f.count / logged.length) * 100)}%)`)
      .join("\n");

    let analysis = `Analisis de sueno (${logged.length} noches en ${args.days ?? 30} dias):
- Duracion promedio: ${avgDur}
- Score promedio: ${avgScore}/100
- Consistencia: ${stats.consistencyScore}%

Factores mas frecuentes:
${factors}`;

    if (avgScore < 60) {
      analysis +=
        "\n\nTu score promedio es bajo. Recomiendo revisar tu rutina de sueno y reducir factores negativos.";
    } else if (avgScore >= 80) {
      analysis +=
        "\n\nTu score promedio es muy bueno. Segui con tus habitos actuales.";
    }

    return analysis;
  },
});
