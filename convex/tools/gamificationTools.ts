import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const getXPProfile = createTool({
  description:
    "Obtener el perfil de gamificacion del usuario: XP total, nivel, progreso, multiplicador de streak",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;

    const profile = await ctx.runQuery(
      internal.functions.challenges.getGamificationProfileInternal,
      { userId }
    );

    if (!profile) {
      return "El usuario aun no tiene perfil de gamificacion. Se creara automaticamente cuando registre su primera accion.";
    }

    // Get best streak from habits
    const habits = await ctx.runQuery(
      internal.functions.habits.getUserHabits,
      { userId }
    );

    const bestStreak = (habits as any[]).reduce(
      (max: number, h: any) => Math.max(max, h.currentStreak),
      0
    );

    const progressPercent =
      profile.xpToNextLevel > 0
        ? Math.round((profile.currentLevelXP / profile.xpToNextLevel) * 100)
        : 100;

    let streakInfo = "";
    if (bestStreak >= 30) streakInfo = " | Multiplicador: x3 (racha 30+ dias)";
    else if (bestStreak >= 14)
      streakInfo = " | Multiplicador: x2 (racha 14+ dias)";
    else if (bestStreak >= 7)
      streakInfo = " | Multiplicador: x1.5 (racha 7+ dias)";

    return `Perfil de gamificacion:
- Nivel: ${profile.level}
- XP Total: ${profile.totalXP}
- Progreso nivel actual: ${profile.currentLevelXP}/${profile.xpToNextLevel} XP (${progressPercent}%)
- Mejor racha actual: ${bestStreak} dias${streakInfo}
- Streak freezes disponibles: ${profile.streakFreezes}`;
  },
});

export const getAchievementsList = createTool({
  description:
    "Obtener los logros del usuario: desbloqueados y disponibles con progreso",
  args: z.object({
    onlyEarned: z
      .boolean()
      .optional()
      .describe("Si true, solo mostrar logros desbloqueados"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;

    const earned = await ctx.runQuery(
      internal.functions.gamification.getUserAchievementsInternal,
      { userId }
    );

    const earnedList = earned as any[];

    if (args.onlyEarned) {
      if (earnedList.length === 0) {
        return "Todavia no desbloqueaste ningun logro. Segui registrando acciones para desbloquear tu primer logro!";
      }

      const lines = earnedList
        .map(
          (a: any) =>
            `- ${a.name}: ${a.description} (+${a.xpAwarded} XP, desbloqueado el ${new Date(a.earnedAt).toLocaleDateString("es-AR")})`
        )
        .join("\n");

      return `Logros desbloqueados (${earnedList.length}):\n${lines}`;
    }

    return `Logros desbloqueados: ${earnedList.length}/25. Usa getAchievementsList con onlyEarned=true para ver los detalles de los desbloqueados.`;
  },
});

export const getActiveChallengeInfo = createTool({
  description:
    "Obtener el challenge semanal activo del usuario con progreso actual",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;

    const challenge = await ctx.runQuery(
      internal.functions.challenges.getActiveChallengeInternal,
      { userId }
    );

    if (!challenge) {
      return "No tenes un challenge activo. Se genera uno nuevo cada lunes.";
    }

    const content = challenge.content as any;
    const currentValue = content.currentValue ?? 0;
    const progressPercent =
      content.targetValue > 0
        ? Math.min(
            100,
            Math.round((currentValue / content.targetValue) * 100)
          )
        : 0;

    const expiresIn = challenge.expiresAt
      ? Math.max(
          0,
          Math.ceil(
            (challenge.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)
          )
        )
      : "?";

    let tips = "";
    if (content.tips?.length > 0) {
      tips = "\nTips:\n" + content.tips.map((t: string) => `- ${t}`).join("\n");
    }

    return `Challenge activo: ${content.title}
- Descripcion: ${content.description}
- Tipo: ${content.type} | Dificultad: ${content.difficulty}
- Progreso: ${currentValue}/${content.targetValue} (${progressPercent}%)
- XP al completar: +${content.xpReward} XP
- Dias restantes: ${expiresIn}${tips}`;
  },
});

export const getChallengeHistory = createTool({
  description:
    "Obtener historial de challenges completados y archivados",
  args: z.object({
    limit: z
      .number()
      .optional()
      .describe("Cantidad de challenges a retornar (default 10)"),
  }),
  handler: async (ctx, args): Promise<string> => {
    const userId = ctx.userId as Id<"users">;

    const challenges = await ctx.runQuery(
      internal.functions.challenges.getChallengesInternal,
      { userId, limit: args.limit }
    );

    const list = challenges as any[];

    if (list.length === 0) {
      return "Todavia no tenes historial de challenges.";
    }

    const lines = list
      .map((c: any) => {
        const content = c.content as any;
        const status =
          c.status === "completed"
            ? "Completado"
            : c.status === "active"
              ? "Activo"
              : "Archivado";
        return `- ${content.title} [${status}] (${content.difficulty}, +${content.xpReward} XP)`;
      })
      .join("\n");

    return `Historial de challenges (${list.length}):\n${lines}`;
  },
});

export const useStreakFreezeAction = createTool({
  description:
    "Usar un streak freeze para proteger la racha del usuario",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
    const userId = ctx.userId as Id<"users">;

    const result = (await ctx.runMutation(
      internal.functions.gamification.useStreakFreeze,
      { userId }
    )) as { success: boolean; remainingFreezes: number };

    if (result.success) {
      return `Streak freeze usado exitosamente! Freezes restantes: ${result.remainingFreezes}. Tu racha esta protegida por hoy.`;
    }

    return `No se pudo usar el streak freeze. Freezes disponibles: ${result.remainingFreezes}. Podes ganar un freeze nuevo los lunes si estuviste activo durante la semana.`;
  },
});
