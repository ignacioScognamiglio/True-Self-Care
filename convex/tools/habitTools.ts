import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const logWater = createTool({
  description: "Registra consumo de agua del usuario en mililitros",
  args: z.object({
    amount: z.number().describe("Cantidad de agua en mililitros"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.wellness.logWaterEntry, {
      userId,
      amount: args.amount,
    });
    return `Registrado: ${args.amount}ml de agua`;
  },
});

export const trackHabit = createTool({
  description: "Marca un habito como completado para hoy",
  args: z.object({
    habitName: z.string().describe("Nombre del habito a marcar como completado"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const result = await ctx.runMutation(
      internal.functions.habits.completeHabit,
      { userId, habitName: args.habitName }
    );
    return `Habito "${args.habitName}" completado. Racha actual: ${result.currentStreak} dias`;
  },
});

export const getHabits = createTool({
  description: "Obtiene la lista de habitos activos del usuario con sus streaks",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const habits = await ctx.runQuery(
      internal.functions.habits.getUserHabits,
      { userId }
    );

    if (habits.length === 0) {
      return "El usuario no tiene habitos activos.";
    }

    return habits
      .map(
        (h: any) =>
          `- ${h.name} (${h.category}): racha ${h.currentStreak} dias, mejor racha ${h.longestStreak} dias, frecuencia ${h.frequency}`
      )
      .join("\n");
  },
});

export const getWaterIntake = createTool({
  description: "Obtiene el consumo de agua del usuario para hoy",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const result = await ctx.runQuery(
      internal.functions.wellness.getTodayWaterIntake,
      { userId }
    );
    return `Consumo de agua hoy: ${result.totalMl}ml (${result.entries} registros)`;
  },
});

export const createHabit = createTool({
  description: "Crea un nuevo habito para el usuario",
  args: z.object({
    name: z.string().describe("Nombre del habito"),
    category: z.string().describe("Categoria (ej: salud, ejercicio, bienestar)"),
    frequency: z
      .enum(["daily", "weekly"])
      .describe("Frecuencia: daily o weekly"),
    targetPerPeriod: z
      .number()
      .describe("Veces por periodo objetivo"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.habits.internalCreateHabit, {
      userId,
      name: args.name,
      category: args.category,
      frequency: args.frequency,
      targetPerPeriod: args.targetPerPeriod,
    });
    return `Habito "${args.name}" creado con frecuencia ${args.frequency}, objetivo ${args.targetPerPeriod} veces por periodo`;
  },
});
