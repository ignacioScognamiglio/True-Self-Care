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
  description: "Crea un plan de entrenamiento personalizado",
  args: z.object({
    goal: z
      .string()
      .describe("Objetivo (ej: fuerza, hipertrofia, resistencia)"),
    daysPerWeek: z.number().describe("Dias de entrenamiento por semana"),
    fitnessLevel: z
      .enum(["beginner", "intermediate", "advanced"])
      .describe("Nivel del usuario"),
    equipment: z
      .array(z.string())
      .optional()
      .describe("Equipamiento disponible"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const planContent = {
      goal: args.goal,
      daysPerWeek: args.daysPerWeek,
      fitnessLevel: args.fitnessLevel,
      equipment: args.equipment ?? [],
      generatedAt: Date.now(),
    };
    await ctx.runMutation(internal.functions.plans.createPlan, {
      userId,
      type: "workout",
      content: planContent,
    });
    return `Plan de entrenamiento creado: ${args.daysPerWeek} dias/semana, nivel ${args.fitnessLevel}, meta: ${args.goal}`;
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
