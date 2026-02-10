// ═══ XP PER ACTION ═══

export const XP_PER_ACTION = {
  water: 5,
  habit: 10,
  mood: 10,
  sleep: 15,
  journal: 15,
  meal: 15,
  exercise: 20,
  challenge: 50,
} as const;

export type XPAction = keyof typeof XP_PER_ACTION;

// ═══ LEVEL TABLE (1-50) ═══

function generateLevelTable(maxLevel: number) {
  const table: Array<{ level: number; xpRequired: number; totalXP: number }> = [];
  let totalXP = 0;
  for (let level = 1; level <= maxLevel; level++) {
    const xpRequired = Math.round(100 * level * Math.pow(1.1, level - 1));
    table.push({ level, xpRequired, totalXP });
    totalXP += xpRequired;
  }
  return table;
}

export const LEVEL_TABLE = generateLevelTable(50);

// ═══ STREAK MULTIPLIERS ═══

export const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 3.0, label: "Racha x3" },
  { minDays: 14, multiplier: 2.0, label: "Racha x2" },
  { minDays: 7, multiplier: 1.5, label: "Racha x1.5" },
  { minDays: 0, multiplier: 1.0, label: "" },
] as const;

// ═══ ACHIEVEMENT DEFINITIONS ═══

export type AchievementCategory =
  | "principiante"
  | "constancia"
  | "dedicacion"
  | "explorador"
  | "maestria";

export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  condition: {
    type: "count" | "streak" | "level" | "total_xp" | "special";
    metric?: string;
    target: number;
  };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ── Principiante (5) ──
  { code: "first_water", name: "Primera Gota", description: "Registra tu primera ingesta de agua", category: "principiante", icon: "Droplets", xpReward: 25, condition: { type: "count", metric: "water", target: 1 } },
  { code: "first_meal", name: "Primer Bocado", description: "Registra tu primera comida", category: "principiante", icon: "UtensilsCrossed", xpReward: 25, condition: { type: "count", metric: "meal", target: 1 } },
  { code: "first_exercise", name: "Primer Paso", description: "Registra tu primer ejercicio", category: "principiante", icon: "Dumbbell", xpReward: 25, condition: { type: "count", metric: "exercise", target: 1 } },
  { code: "first_mood", name: "Primer Sentir", description: "Haz tu primer check-in emocional", category: "principiante", icon: "Brain", xpReward: 25, condition: { type: "count", metric: "mood", target: 1 } },
  { code: "first_sleep", name: "Primera Noche", description: "Registra tu primer sueno", category: "principiante", icon: "Moon", xpReward: 25, condition: { type: "count", metric: "sleep", target: 1 } },

  // ── Constancia (7) ──
  { code: "streak_3d", name: "Tres al hilo", description: "Mantene una racha de 3 dias en cualquier habito", category: "constancia", icon: "Flame", xpReward: 50, condition: { type: "streak", metric: "habit", target: 3 } },
  { code: "streak_7d", name: "Semana Perfecta", description: "Mantene una racha de 7 dias en cualquier habito", category: "constancia", icon: "Flame", xpReward: 100, condition: { type: "streak", metric: "habit", target: 7 } },
  { code: "streak_14d", name: "Imparable", description: "Mantene una racha de 14 dias en cualquier habito", category: "constancia", icon: "Flame", xpReward: 200, condition: { type: "streak", metric: "habit", target: 14 } },
  { code: "streak_30d", name: "Maquina de Habitos", description: "Mantene una racha de 30 dias en cualquier habito", category: "constancia", icon: "Flame", xpReward: 500, condition: { type: "streak", metric: "habit", target: 30 } },
  { code: "daily_complete_3", name: "Dia Activo", description: "Completa 3 acciones de bienestar en un dia", category: "constancia", icon: "CheckCircle", xpReward: 50, condition: { type: "special", metric: "daily_actions", target: 3 } },
  { code: "daily_complete_5", name: "Dia Completo", description: "Completa 5 acciones de bienestar en un dia", category: "constancia", icon: "CheckCircle", xpReward: 100, condition: { type: "special", metric: "daily_actions", target: 5 } },
  { code: "weekly_consistent", name: "Semana Consistente", description: "Registra al menos 1 accion cada dia durante 7 dias seguidos", category: "constancia", icon: "Calendar", xpReward: 150, condition: { type: "special", metric: "any_action", target: 7 } },

  // ── Dedicacion (5) ──
  { code: "water_100", name: "Hidratacion Pro", description: "Registra agua 100 veces", category: "dedicacion", icon: "Droplets", xpReward: 200, condition: { type: "count", metric: "water", target: 100 } },
  { code: "meals_50", name: "Chef Personal", description: "Registra 50 comidas", category: "dedicacion", icon: "UtensilsCrossed", xpReward: 200, condition: { type: "count", metric: "meal", target: 50 } },
  { code: "exercise_50", name: "Atleta", description: "Registra 50 sesiones de ejercicio", category: "dedicacion", icon: "Dumbbell", xpReward: 200, condition: { type: "count", metric: "exercise", target: 50 } },
  { code: "mood_30", name: "Autoconsciente", description: "Registra 30 check-ins emocionales", category: "dedicacion", icon: "Brain", xpReward: 200, condition: { type: "count", metric: "mood", target: 30 } },
  { code: "sleep_30", name: "Durmiente Estrella", description: "Registra 30 noches de sueno", category: "dedicacion", icon: "Moon", xpReward: 200, condition: { type: "count", metric: "sleep", target: 30 } },

  // ── Explorador (4) ──
  { code: "multi_3", name: "Explorador", description: "Usa 3 modulos diferentes en un dia", category: "explorador", icon: "Compass", xpReward: 100, condition: { type: "special", metric: "modules_used", target: 3 } },
  { code: "multi_5", name: "Bienestar 360", description: "Usa 5 modulos diferentes en un dia", category: "explorador", icon: "Compass", xpReward: 250, condition: { type: "special", metric: "modules_used", target: 5 } },
  { code: "challenge_1", name: "Desafiante", description: "Completa tu primer challenge semanal", category: "explorador", icon: "Trophy", xpReward: 100, condition: { type: "count", metric: "challenge", target: 1 } },
  { code: "challenge_5", name: "Retador Serial", description: "Completa 5 challenges semanales", category: "explorador", icon: "Trophy", xpReward: 300, condition: { type: "count", metric: "challenge", target: 5 } },

  // ── Maestria (4) ──
  { code: "level_5", name: "Nivel 5", description: "Alcanza el nivel 5", category: "maestria", icon: "Star", xpReward: 100, condition: { type: "level", target: 5 } },
  { code: "level_10", name: "Doble Digito", description: "Alcanza el nivel 10", category: "maestria", icon: "Star", xpReward: 250, condition: { type: "level", target: 10 } },
  { code: "level_25", name: "Veterano", description: "Alcanza el nivel 25", category: "maestria", icon: "Crown", xpReward: 500, condition: { type: "level", target: 25 } },
  { code: "xp_10000", name: "XP Legendario", description: "Acumula 10,000 XP totales", category: "maestria", icon: "Zap", xpReward: 500, condition: { type: "total_xp", target: 10000 } },
];

// ═══ CHALLENGE XP REWARDS ═══

export const CHALLENGE_XP_REWARDS = {
  facil: 50,
  medio: 100,
  dificil: 200,
} as const;

// ═══ CONSTANTS ═══

export const STREAK_FREEZE_COOLDOWN_DAYS = 7;
export const MAX_STREAK_FREEZES = 1;
