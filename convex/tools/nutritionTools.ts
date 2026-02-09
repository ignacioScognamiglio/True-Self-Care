import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const logMeal = createTool({
  description: "Registra una comida del usuario con calorias y macros",
  args: z.object({
    name: z.string().describe("Nombre de la comida"),
    calories: z.number().describe("Calorias totales"),
    protein: z.number().describe("Proteina en gramos"),
    carbs: z.number().describe("Carbohidratos en gramos"),
    fat: z.number().describe("Grasas en gramos"),
    mealType: z
      .enum(["breakfast", "lunch", "dinner", "snack"])
      .describe("Tipo de comida"),
    description: z.string().optional().describe("Descripcion de la comida"),
    items: z.array(z.string()).optional().describe("Lista de alimentos"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.nutrition.logMealEntry, {
      userId,
      meal: {
        name: args.name,
        calories: args.calories,
        protein: args.protein,
        carbs: args.carbs,
        fat: args.fat,
        mealType: args.mealType,
        description: args.description,
        items: args.items,
      },
    });
    return `Registrado: ${args.name} (${args.calories} kcal, P:${args.protein}g C:${args.carbs}g G:${args.fat}g)`;
  },
});

export const analyzeFoodImage = createTool({
  description:
    "Analiza una foto de comida y estima calorias y macros. Usa cuando el usuario envie una foto de su comida.",
  args: z.object({
    imageDescription: z
      .string()
      .describe("Descripcion de lo que se ve en la foto de comida"),
  }),
  handler: async (_ctx, args): Promise<string> => {
    return `Analisis de la foto: ${args.imageDescription}\n\nPara registrar esta comida, usa la herramienta logMeal con los valores estimados basados en lo que se ve en la foto. Recuerda que es una estimacion basada en la imagen.`;
  },
});

export const createMealPlan = createTool({
  description: "Crea un plan de comidas personalizado para el usuario",
  args: z.object({
    goal: z
      .string()
      .describe("Objetivo del plan (ej: perder peso, ganar musculo)"),
    dailyCalories: z.number().describe("Calorias diarias objetivo"),
    daysCount: z.number().describe("Numero de dias del plan (1-7)"),
    restrictions: z
      .array(z.string())
      .optional()
      .describe("Restricciones alimentarias"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const planContent = {
      goal: args.goal,
      dailyCalories: args.dailyCalories,
      daysCount: args.daysCount,
      restrictions: args.restrictions ?? [],
      generatedAt: Date.now(),
    };
    await ctx.runMutation(internal.functions.plans.createPlan, {
      userId,
      type: "meal",
      content: planContent,
    });
    return `Plan de comidas creado: ${args.daysCount} dias, objetivo ${args.dailyCalories} kcal/dia, meta: ${args.goal}`;
  },
});

export const getNutritionSummary = createTool({
  description: "Obtiene el resumen nutricional del usuario para hoy",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const summary = await ctx.runQuery(
      internal.functions.nutrition.getTodayNutritionSummary,
      { userId }
    );

    if (summary.mealCount === 0) {
      return "No hay comidas registradas hoy.";
    }

    const meals = summary.meals
      .map(
        (m: any) => `- ${m.name} (${m.mealType}): ${m.calories} kcal`
      )
      .join("\n");

    return `Resumen nutricional de hoy:\nCalorias: ${summary.totalCalories} kcal\nProteina: ${summary.totalProtein}g\nCarbohidratos: ${summary.totalCarbs}g\nGrasas: ${summary.totalFat}g\nComidas (${summary.mealCount}):\n${meals}`;
  },
});

