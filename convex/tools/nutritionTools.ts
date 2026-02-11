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

export const createMealPlan = createTool({
  description:
    "Crea un plan de comidas personalizado con dias y comidas detalladas",
  args: z.object({
    title: z
      .string()
      .describe("Titulo del plan (ej: Plan de comidas para ganar musculo)"),
    objective: z
      .string()
      .optional()
      .describe("Objetivo del plan (ej: perder peso, ganar musculo)"),
    dailyCalories: z
      .number()
      .optional()
      .describe("Calorias diarias objetivo"),
    days: z
      .array(
        z.object({
          day: z.string().describe("Nombre del dia (ej: Lunes)"),
          meals: z.array(
            z.object({
              name: z
                .string()
                .describe("Nombre de la comida (ej: Avena con banana y miel)"),
              calories: z.number().describe("Calorias de la comida"),
              protein: z.number().describe("Proteina en gramos"),
              carbs: z.number().describe("Carbohidratos en gramos"),
              fat: z.number().describe("Grasas en gramos"),
              mealType: z
                .string()
                .describe("Tipo: breakfast, lunch, dinner o snack"),
              ingredients: z
                .array(z.string())
                .optional()
                .describe("Lista de ingredientes"),
            })
          ),
        })
      )
      .describe("Array de dias con comidas completas"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const planContent = {
      title: args.title,
      objective: args.objective,
      dailyCalories: args.dailyCalories,
      days: args.days,
      generatedAt: Date.now(),
    };
    await ctx.runMutation(internal.functions.plans.createPlan, {
      userId,
      type: "meal",
      content: planContent,
    });
    const totalMeals = args.days.reduce(
      (sum, d) => sum + d.meals.length,
      0
    );
    return `Plan de comidas "${args.title}" creado: ${args.days.length} dias, ${totalMeals} comidas totales.`;
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

