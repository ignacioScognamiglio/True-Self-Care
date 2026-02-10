import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const logExercise = createTool({
  description: "Registra un ejercicio completado por el usuario",
  args: z.object({
    name: z.string().describe("Nombre del ejercicio"),
    type: z
      .enum(["strength", "cardio", "flexibility", "sport"])
      .describe("Tipo de ejercicio"),
    sets: z.number().optional().describe("Numero de series"),
    reps: z.number().optional().describe("Repeticiones por serie"),
    weight: z.number().optional().describe("Peso en kg"),
    duration: z.number().optional().describe("Duracion en minutos"),
    distance: z.number().optional().describe("Distancia en km"),
    caloriesBurned: z
      .number()
      .optional()
      .describe("Calorias quemadas estimadas"),
    notes: z.string().optional().describe("Notas adicionales"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.fitness.logExerciseEntry, {
      userId,
      exercise: {
        name: args.name,
        type: args.type,
        sets: args.sets,
        reps: args.reps,
        weight: args.weight,
        duration: args.duration,
        distance: args.distance,
        caloriesBurned: args.caloriesBurned,
        notes: args.notes,
      },
    });
    const details = [
      args.sets ? `${args.sets}x${args.reps ?? "?"}` : "",
      args.weight ? `${args.weight}kg` : "",
      args.duration ? `${args.duration}min` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `Registrado: ${args.name} ${details}`.trim();
  },
});

export const createWorkoutPlan = createTool({
  description:
    "Crea un plan de entrenamiento personalizado con dias y ejercicios completos",
  args: z.object({
    title: z.string().describe("Titulo del plan (ej: Plan Powerlifting 4 dias)"),
    objective: z
      .string()
      .optional()
      .describe("Objetivo del plan (ej: fuerza, hipertrofia, resistencia)"),
    daysPerWeek: z.number().describe("Dias de entrenamiento por semana"),
    days: z
      .array(
        z.object({
          day: z.string().describe("Nombre del dia (ej: Dia 1)"),
          focus: z
            .string()
            .describe("Enfoque del dia (ej: Squat + accesorios)"),
          estimatedDuration: z
            .number()
            .optional()
            .describe("Duracion estimada en minutos"),
          exercises: z.array(
            z.object({
              name: z.string().describe("Nombre del ejercicio (ej: Sentadilla)"),
              sets: z.number().describe("Numero de series"),
              reps: z.string().describe("Repeticiones (ej: '5' o '8-12')"),
              rest: z
                .number()
                .describe("Descanso entre series en segundos"),
              notes: z
                .string()
                .optional()
                .describe("Notas adicionales (ej: RPE 8, tempo 3-1-1)"),
            })
          ),
        })
      )
      .describe("Array de dias con ejercicios completos"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const planContent = {
      title: args.title,
      objective: args.objective,
      daysPerWeek: args.daysPerWeek,
      days: args.days,
      generatedAt: Date.now(),
    };
    await ctx.runMutation(internal.functions.plans.createPlan, {
      userId,
      type: "workout",
      content: planContent,
    });
    const totalExercises = args.days.reduce(
      (sum, d) => sum + d.exercises.length,
      0
    );
    return `Plan de entrenamiento "${args.title}" creado: ${args.days.length} dias, ${totalExercises} ejercicios totales.`;
  },
});

export const adjustIntensity = createTool({
  description:
    "Ajusta la intensidad de un ejercicio actual basandose en el feedback del usuario",
  args: z.object({
    exerciseName: z.string().describe("Nombre del ejercicio"),
    feedback: z
      .enum(["too_easy", "just_right", "too_hard"])
      .describe("Feedback del usuario"),
    currentWeight: z.number().optional().describe("Peso actual en kg"),
    currentReps: z.number().optional().describe("Reps actuales"),
  }),
  handler: async (_ctx, args): Promise<string> => {
    const { exerciseName, feedback, currentWeight, currentReps } = args;

    if (feedback === "just_right") {
      return `${exerciseName}: La intensidad esta bien. Mantene el peso y las reps actuales.`;
    }

    if (feedback === "too_easy") {
      const newWeight = currentWeight
        ? Math.round(currentWeight * 1.075 * 10) / 10
        : null;
      const newReps = currentReps ? currentReps + 2 : null;
      const suggestions = [];
      if (newWeight) suggestions.push(`subir a ${newWeight}kg`);
      if (newReps) suggestions.push(`aumentar a ${newReps} reps`);
      return `${exerciseName}: Muy facil. Recomendacion: ${suggestions.join(" o ")}. Aumenta gradualmente para progresar.`;
    }

    // too_hard
    const newWeight = currentWeight
      ? Math.round(currentWeight * 0.875 * 10) / 10
      : null;
    const newReps = currentReps ? Math.max(currentReps - 2, 1) : null;
    const suggestions = [];
    if (newWeight) suggestions.push(`bajar a ${newWeight}kg`);
    if (newReps) suggestions.push(`reducir a ${newReps} reps`);
    return `${exerciseName}: Muy dificil. Recomendacion: ${suggestions.join(" o ")}. No hay vergüenza en bajar peso — la tecnica correcta es prioridad.`;
  },
});

export const getExerciseSummary = createTool({
  description: "Obtiene el resumen de ejercicio del usuario para hoy",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const summary = await ctx.runQuery(
      internal.functions.fitness.getTodayExerciseSummary,
      { userId }
    );

    if (summary.exerciseCount === 0) {
      return "No hay ejercicios registrados hoy.";
    }

    const exercises = summary.exercises
      .map((e: any) => {
        const details = [
          e.sets ? `${e.sets}x${e.reps ?? "?"}` : "",
          e.weight ? `${e.weight}kg` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `- ${e.name} (${e.type}) ${details}`;
      })
      .join("\n");

    return `Resumen de ejercicio hoy:\nEjercicios: ${summary.exerciseCount}\nCalorias quemadas: ${summary.totalCaloriesBurned} kcal\nDuracion total: ${summary.totalDuration} min\nVolumen total: ${summary.totalVolume} kg\n\n${exercises}`;
  },
});

export const getWorkoutHistory = createTool({
  description:
    "Obtiene el historial de ejercicios del usuario de los ultimos dias",
  args: z.object({
    days: z
      .number()
      .optional()
      .describe("Numero de dias de historial (default 7)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const history = await ctx.runQuery(
      internal.functions.fitness.getExerciseHistoryInternal,
      { userId, days: args.days }
    );

    const activeDays = (history as any[]).filter(
      (d: any) => d.exerciseCount > 0
    );

    if (activeDays.length === 0) {
      return `No hay ejercicios registrados en los ultimos ${args.days ?? 7} dias.`;
    }

    const lines = activeDays
      .map(
        (d: any) =>
          `- ${new Date(d.date).toLocaleDateString("es")}: ${d.exerciseCount} ejercicios, ${d.totalCaloriesBurned} kcal, volumen ${d.totalVolume}kg, ${d.totalDuration}min`
      )
      .join("\n");

    return `Historial de ejercicio (${args.days ?? 7} dias):\nDias activos: ${activeDays.length}\n\n${lines}`;
  },
});
