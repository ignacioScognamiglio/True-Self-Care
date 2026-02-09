import { internalMutation } from "./_generated/server";
import { startOfDay, subDays } from "date-fns";

export const checkHydration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = new Date();

    for (const user of users) {
      if (!user.preferences?.notificationsEnabled) continue;

      const todayStart = startOfDay(now).getTime();
      const entries = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "water")
        )
        .filter((q) => q.gte(q.field("timestamp"), todayStart))
        .collect();

      const totalMl = entries.reduce(
        (sum, e) => sum + (e.data?.amount ?? 0),
        0
      );
      const goalMl = 2500;

      if (totalMl < goalMl * 0.5 && now.getUTCHours() >= 15) {
        // Past noon Argentina time (UTC-3, so 15 UTC = 12 ART)
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "hydration_reminder",
          title: "Recordatorio de hidratacion",
          body: `Llevas ${totalMl}ml de ${goalMl}ml. No olvides tomar agua!`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const checkPendingHabits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const todayStart = startOfDay(new Date()).getTime();

    for (const user of users) {
      const habits = await ctx.db
        .query("habits")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      if (habits.length === 0) continue;

      const completions = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "habit")
        )
        .filter((q) => q.gte(q.field("timestamp"), todayStart))
        .collect();

      const completedHabitIds = new Set(
        completions.map((c) => c.data?.habitId)
      );
      const pending = habits.filter((h) => !completedHabitIds.has(h._id));

      if (pending.length > 0) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "habits_reminder",
          title: "Habitos pendientes",
          body: `Tienes ${pending.length} habito${pending.length > 1 ? "s" : ""} pendiente${pending.length > 1 ? "s" : ""} para hoy`,
          read: false,
          actionUrl: "/dashboard/habits",
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const resetMissedStreaks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday).getTime();
    const yesterdayEnd = yesterdayStart + 24 * 60 * 60 * 1000;

    const allHabits = await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const habit of allHabits) {
      if (habit.currentStreak === 0) continue;

      const completions = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", habit.userId).eq("type", "habit")
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("data.habitId"), habit._id),
            q.gte(q.field("timestamp"), yesterdayStart),
            q.lt(q.field("timestamp"), yesterdayEnd)
          )
        )
        .first();

      if (!completions) {
        await ctx.db.patch(habit._id, { currentStreak: 0 });
      }
    }
  },
});
