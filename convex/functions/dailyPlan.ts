import { v } from "convex/values";
import {
  mutation,
  internalAction,
  internalQuery,
  internalMutation,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getAuthenticatedUser } from "../lib/auth";

// ═══ INTERNAL ACTIONS ═══

export const generateDailyPlan = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all users with notifications enabled
    const users = await ctx.runQuery(
      internal.functions.dailyPlan.getAllUsersForPlan,
      {}
    );

    for (const user of users) {
      try {
        // 1. Gather recent data (3 days)
        const recentData = await ctx.runQuery(
          internal.functions.insights.gatherCrossDomainData,
          { userId: user._id, days: 3 }
        );

        const daysData = (recentData as any).days;

        // Check if user has enough data (at least 1 active day)
        const activeDays = daysData.filter(
          (d: any) =>
            d.sleep.logged ||
            d.nutrition.mealCount > 0 ||
            d.fitness.exerciseCount > 0 ||
            d.mood.checkInCount > 0 ||
            d.habits.completedCount > 0 ||
            d.hydration.totalMl > 0
        );

        if (activeDays.length === 0) continue;

        // 2. Get active plans
        const mealPlan = await ctx.runQuery(
          internal.functions.plans.getActivePlan,
          { userId: user._id, type: "meal" }
        );
        const workoutPlan = await ctx.runQuery(
          internal.functions.plans.getActivePlan,
          { userId: user._id, type: "workout" }
        );
        const sleepRoutine = await ctx.runQuery(
          internal.functions.plans.getActivePlan,
          { userId: user._id, type: "sleep_routine" }
        );

        // 3. Get recent insights
        const insights = await ctx.runQuery(
          internal.functions.insights.getRecentInsightsInternal,
          { userId: user._id, limit: 5 }
        );

        // 4. Build the prompt
        const now = new Date();
        const daysOfWeek = [
          "Domingo", "Lunes", "Martes", "Miercoles",
          "Jueves", "Viernes", "Sabado",
        ];
        const dayOfWeek = daysOfWeek[now.getDay()];
        const date = now.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        });

        const insightsText =
          insights.length > 0
            ? insights
                .map((i: any) => `- ${i.title}: ${i.body}`)
                .join("\n")
            : "No hay insights recientes.";

        const prompt = `Genera un plan diario personalizado para hoy basado en los datos del usuario.

DATOS RECIENTES (3 dias):
${JSON.stringify(daysData, null, 2)}

PLANES ACTIVOS:
- Comidas: ${mealPlan ? "Si - " + ((mealPlan.content as any)?.title ?? "Plan activo") : "No"}
- Entrenamiento: ${workoutPlan ? "Si - " + ((workoutPlan.content as any)?.title ?? "Plan activo") : "No"}
- Rutina sueno: ${sleepRoutine ? "Si - " + ((sleepRoutine.content as any)?.title ?? "Rutina activa") : "No"}

INSIGHTS RECIENTES:
${insightsText}

DIA DE HOY: ${dayOfWeek} ${date}

REGLAS:
- Genera un plan con 3 secciones: manana (6-12), tarde (12-18), noche (18-23).
- Cada seccion: 3-4 items accionables y concretos.
- Integra los planes activos del usuario (comida del dia, ejercicio programado, rutina de sueno).
- Incluye 1-2 insights relevantes para hoy.
- Se concreto: "Almuerzo: ensalada cesar con pollo (450 kcal)" en vez de "Almorzar saludable".
- Responde en espanol.

Responde SOLO en formato JSON (sin markdown, sin backticks):
{
  "title": "Tu plan para hoy - ${dayOfWeek} ${date}",
  "sections": [
    {
      "period": "morning",
      "label": "Manana (6:00 - 12:00)",
      "icon": "sun",
      "items": [
        {
          "id": "uuid-unico",
          "text": "Descripcion concreta del item",
          "domain": "hydration|nutrition|fitness|sleep|habits|mental",
          "completed": false
        }
      ]
    },
    {
      "period": "afternoon",
      "label": "Tarde (12:00 - 18:00)",
      "icon": "sunset",
      "items": [...]
    },
    {
      "period": "evening",
      "label": "Noche (18:00 - 23:00)",
      "icon": "moon",
      "items": [...]
    }
  ],
  "insights": ["Insight relevante 1", "Insight relevante 2"]
}`;

        const { text } = await generateText({
          model: google("gemini-2.5-flash"),
          prompt,
        });

        // Parse JSON from response
        const cleaned = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const planContent = JSON.parse(cleaned);

        // Add generatedAt timestamp
        planContent.generatedAt = Date.now();

        // 5. Save as daily plan (archives previous active plan automatically)
        await ctx.runMutation(internal.functions.plans.createPlan, {
          userId: user._id,
          type: "daily",
          content: planContent,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // expires in 24h
        });

        // 6. Create notification
        await ctx.runMutation(
          internal.functions.dailyPlan.createDailyPlanNotification,
          {
            userId: user._id,
            title: "Tu plan del dia esta listo!",
            body: `${planContent.title} - Revisa tu Daily Hub para ver tus tareas de hoy.`,
          }
        );
      } catch (error) {
        console.error(
          `Error generating daily plan for user ${user._id}:`,
          error
        );
      }
    }
  },
});

export const generateWeeklySummary = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(
      internal.functions.dailyPlan.getAllUsersForPlan,
      {}
    );

    for (const user of users) {
      try {
        // 1. Gather 7 days of data
        const weekData = await ctx.runQuery(
          internal.functions.insights.gatherCrossDomainData,
          { userId: user._id, days: 7 }
        );

        const daysData = (weekData as any).days;

        // Check if user has enough data
        const activeDays = daysData.filter(
          (d: any) =>
            d.sleep.logged ||
            d.nutrition.mealCount > 0 ||
            d.fitness.exerciseCount > 0 ||
            d.mood.checkInCount > 0 ||
            d.habits.completedCount > 0 ||
            d.hydration.totalMl > 0
        );

        if (activeDays.length < 3) continue;

        // 2. Get correlations
        const correlations = await ctx.runQuery(
          internal.functions.insights.calculateCorrelations,
          { userId: user._id, days: 7 }
        );

        const correlationsText =
          (correlations as any[]).length > 0
            ? (correlations as any[])
                .map(
                  (c: any) =>
                    `- ${c.label}: r=${c.correlation} (${c.strength}, ${c.direction})`
                )
                .join("\n")
            : "Sin correlaciones significativas esta semana.";

        // 3. Build prompt
        const now = new Date();
        const weekStart = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        const startStr = weekStart.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
        });
        const endStr = now.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
        });

        const prompt = `Genera un resumen semanal personalizado basado en los datos del usuario de los ultimos 7 dias.

DATOS DE LA SEMANA:
${JSON.stringify(daysData, null, 2)}

CORRELACIONES ENCONTRADAS:
${correlationsText}

PERIODO: ${startStr} al ${endStr}

REGLAS:
- Genera un resumen con highlights por dominio (sueno, nutricion, fitness, habitos, animo, hidratacion).
- Incluye tendencias (up/down/stable) para cada dominio con datos.
- Calcula estadisticas clave.
- Da 3 sugerencias concretas para la proxima semana.
- Incluye el insight mas relevante de la semana.
- Se positivo pero honesto sobre las areas de mejora.
- Responde en espanol.

Responde SOLO en formato JSON (sin markdown, sin backticks):
{
  "title": "Resumen semanal - ${startStr} al ${endStr}",
  "period": {
    "start": ${weekStart.getTime()},
    "end": ${now.getTime()}
  },
  "highlights": [
    {
      "domain": "sleep|nutrition|fitness|habits|animo|hydration",
      "title": "Titulo corto del highlight",
      "description": "Descripcion con datos concretos",
      "trend": "up|down|stable"
    }
  ],
  "stats": {
    "avgSleepScore": 0,
    "avgCalories": 0,
    "totalExercises": 0,
    "habitsCompletionRate": 0,
    "avgMoodIntensity": 0,
    "totalWaterMl": 0
  },
  "topInsight": "El insight mas relevante de la semana",
  "nextWeekSuggestions": [
    "Sugerencia concreta 1",
    "Sugerencia concreta 2",
    "Sugerencia concreta 3"
  ]
}`;

        const { text } = await generateText({
          model: google("gemini-2.5-flash"),
          prompt,
        });

        // Parse JSON
        const cleaned = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const summaryContent = JSON.parse(cleaned);

        // 4. Save as weekly summary
        await ctx.runMutation(internal.functions.plans.createPlan, {
          userId: user._id,
          type: "weekly",
          content: summaryContent,
        });

        // 5. Create notification
        await ctx.runMutation(
          internal.functions.dailyPlan.createDailyPlanNotification,
          {
            userId: user._id,
            title: "Tu resumen semanal esta listo!",
            body: `Revisa como te fue del ${startStr} al ${endStr}.`,
          }
        );
      } catch (error) {
        console.error(
          `Error generating weekly summary for user ${user._id}:`,
          error
        );
      }
    }
  },
});

// ═══ HELPER QUERIES / MUTATIONS ═══

export const getAllUsersForPlan = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.preferences?.notificationsEnabled);
  },
});

export const createDailyPlanNotification = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "daily_plan",
      title: args.title,
      body: args.body,
      read: false,
      actionUrl: "/dashboard",
      createdAt: Date.now(),
    });
  },
});

// ═══ PUBLIC MUTATIONS ═══

export const toggleDailyPlanItem = mutation({
  args: {
    planId: v.id("aiPlans"),
    sectionIndex: v.number(),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan || plan.userId !== user._id) {
      throw new Error("Plan no encontrado");
    }

    if (plan.type !== "daily") {
      throw new Error("Solo se pueden marcar items de planes diarios");
    }

    const content = plan.content as any;
    const section = content.sections?.[args.sectionIndex];
    if (!section) throw new Error("Seccion no encontrada");

    const item = section.items?.[args.itemIndex];
    if (!item) throw new Error("Item no encontrado");

    item.completed = !item.completed;

    await ctx.db.patch(args.planId, { content });
  },
});
