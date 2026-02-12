import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const logMood = createTool({
  description:
    "Registra el estado de animo del usuario con mood, intensidad, emociones y triggers",
  args: z.object({
    mood: z
      .string()
      .describe(
        "Estado de animo: feliz, calmado, neutral, triste, ansioso, enojado, estresado, agotado"
      ),
    intensity: z
      .number()
      .min(1)
      .max(10)
      .describe("Intensidad del 1 al 10"),
    notes: z.string().optional().describe("Notas adicionales del usuario"),
    triggers: z
      .array(z.string())
      .optional()
      .describe("Triggers: trabajo, familia, relaciones, salud, dinero, estudios, descanso, ejercicio"),
    emotions: z
      .array(z.string())
      .optional()
      .describe("Emociones: alegria, gratitud, esperanza, amor, ansiedad, frustracion, tristeza, soledad, confusion, culpa, envidia, ira"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.mental.logMoodEntry, {
      userId,
      mood: {
        mood: args.mood,
        intensity: args.intensity,
        notes: args.notes,
        triggers: args.triggers,
        emotions: args.emotions,
      },
    });
    return `Estado de animo registrado: ${args.mood}, intensidad ${args.intensity}/10${args.emotions?.length ? `. Emociones: ${args.emotions.join(", ")}` : ""}`;
  },
});

export const getMoodHistory = createTool({
  description:
    "Obtiene el historial de estados de animo del usuario agrupado por dia",
  args: z.object({
    days: z
      .number()
      .optional()
      .describe("Numero de dias de historial (default 7)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const history = await ctx.runQuery(
      internal.functions.mental.getMoodHistoryInternal,
      { userId, days: args.days }
    );

    const activeDays = (history as any[]).filter(
      (d: any) => d.checkInCount > 0
    );

    if (activeDays.length === 0) {
      return `No hay check-ins de animo en los ultimos ${args.days ?? 7} dias.`;
    }

    const lines = activeDays
      .map(
        (d: any) =>
          `- ${new Date(d.date).toLocaleDateString("es")}: ${d.dominantMood} (intensidad promedio ${d.averageIntensity}/10, ${d.checkInCount} check-in${d.checkInCount > 1 ? "s" : ""})`
      )
      .join("\n");

    return `Historial de animo (${args.days ?? 7} dias):\nDias con check-in: ${activeDays.length}\n\n${lines}`;
  },
});

export const createJournalEntry = createTool({
  description: "Crea una entrada de journal/diario para el usuario",
  args: z.object({
    title: z.string().describe("Titulo de la entrada"),
    content: z.string().describe("Contenido de la entrada"),
    prompt: z
      .string()
      .optional()
      .describe("Prompt que inspiro la entrada"),
    mood: z.string().optional().describe("Estado de animo asociado"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Tags para categorizar la entrada"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.mental.createJournalEntry, {
      userId,
      journal: {
        title: args.title,
        content: args.content,
        prompt: args.prompt,
        mood: args.mood,
        tags: args.tags,
      },
    });
    return `Entrada de journal creada: "${args.title}"${args.tags?.length ? ` [${args.tags.join(", ")}]` : ""}`;
  },
});

export const getJournalEntries = createTool({
  description: "Obtiene las entradas de journal del usuario",
  args: z.object({
    limit: z
      .number()
      .optional()
      .describe("Numero maximo de entradas (default 10)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    const entries = await ctx.runQuery(
      internal.functions.mental.getJournalEntriesInternal,
      { userId, limit: args.limit }
    );

    if ((entries as any[]).length === 0) {
      return "No hay entradas de journal.";
    }

    const lines = (entries as any[])
      .map(
        (e: any) =>
          `- "${e.data.title}" (${new Date(e.timestamp).toLocaleDateString("es")})${e.data.tags?.length ? ` [${e.data.tags.join(", ")}]` : ""}`
      )
      .join("\n");

    return `Entradas de journal recientes:\n${lines}`;
  },
});

export const suggestExercise = createTool({
  description:
    "Sugiere un ejercicio de bienestar mental apropiado para el usuario",
  args: z.object({
    type: z
      .enum(["breathing", "gratitude", "reframing"])
      .describe(
        "Tipo de ejercicio: breathing (respiracion 4-7-8), gratitude (gratitud), reframing (reestructuracion cognitiva CBT)"
      ),
    context: z
      .string()
      .optional()
      .describe("Contexto emocional actual del usuario para personalizar"),
  }),
  handler: async (_ctx, args): Promise<string> => {
    const exercises: Record<string, string> = {
      breathing: `Ejercicio de respiracion 4-7-8:
1. Inhala por la nariz contando hasta 4
2. Mantene el aire contando hasta 7
3. Exhala lentamente por la boca contando hasta 8
4. Repeti 4 ciclos

Este ejercicio activa el sistema nervioso parasimpatico y reduce la ansiedad. El usuario puede hacerlo en /dashboard/chat.`,
      gratitude: `Ejercicio de gratitud (3 pasos):
1. Algo pequeno que te hizo sonreir hoy
2. Una persona que aprecies en tu vida
3. Algo de ti mismo/a que valores

La gratitud activa circuitos de recompensa y mejora el bienestar. El usuario puede hacerlo en /dashboard/chat.`,
      reframing: `Ejercicio de reestructuracion cognitiva (CBT):
1. Describe la situacion que te afecta
2. Identifica el pensamiento automatico
3. Nombra la emocion e intensidad
4. Busca evidencia a favor del pensamiento
5. Busca evidencia en contra
6. Formula un pensamiento alternativo mas equilibrado
7. Reevalua la intensidad emocional

El usuario puede hacerlo guiado en /dashboard/chat.`,
    };

    const exercise = exercises[args.type];
    const contextNote = args.context
      ? `\nContexto del usuario: ${args.context}`
      : "";

    return `${exercise}${contextNote}`;
  },
});

export const logCrisisIncident = createTool({
  description:
    "Registra un incidente de crisis detectado. SOLO usar cuando se detectan senales claras de crisis.",
  args: z.object({
    triggerMessage: z
      .string()
      .describe("El mensaje del usuario que activo la alerta"),
    detectedKeywords: z
      .array(z.string())
      .describe("Keywords de crisis detectados en el mensaje"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;
    await ctx.runMutation(internal.functions.mental.logCrisisIncident, {
      userId,
      triggerMessage: args.triggerMessage,
      detectedKeywords: args.detectedKeywords,
    });
    return "Incidente de crisis registrado. Priorizar respuesta de crisis con recursos de ayuda.";
  },
});
