import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const getCrossDomainInsights = createTool({
  description:
    "Obtiene insights cross-domain que conectan sueno, nutricion, fitness y animo del usuario",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const insights = (await ctx.runQuery(
      internal.functions.insights.getRecentInsightsInternal,
      { userId }
    )) as any[];

    if (insights.length === 0) {
      return "No hay insights cross-domain disponibles todavia. Se necesitan al menos 5 dias de datos registrados para generar insights.";
    }

    const lines = insights
      .map(
        (i: any) =>
          `- **${i.title}**: ${i.body}${i.actionUrl ? ` (ver: ${i.actionUrl})` : ""}`
      )
      .join("\n");

    return `Insights cross-domain recientes (${insights.length}):\n${lines}`;
  },
});

export const getCorrelations = createTool({
  description:
    "Obtiene correlaciones entre diferentes metricas de bienestar del usuario",
  args: z.object({
    days: z
      .number()
      .optional()
      .describe("Numero de dias a analizar (default 30)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const correlations = (await ctx.runQuery(
      internal.functions.insights.calculateCorrelations,
      { userId, days: args.days }
    )) as any[];

    if (correlations.length === 0) {
      return `No se encontraron correlaciones significativas en los ultimos ${args.days ?? 30} dias. Se necesitan al menos 5 dias con datos en multiples dominios.`;
    }

    const lines = correlations
      .map(
        (c: any) =>
          `- ${c.label}: correlacion ${c.direction} ${c.strength} (r=${c.correlation}, ${c.dataPoints} datos)`
      )
      .join("\n");

    return `Correlaciones encontradas (${args.days ?? 30} dias):\n${lines}`;
  },
});
