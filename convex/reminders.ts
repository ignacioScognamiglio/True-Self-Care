import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
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
        const title = "Recordatorio de hidratacion";
        const body = `Llevas ${totalMl}ml de ${goalMl}ml. No olvides tomar agua!`;
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "hydration_reminder",
          title,
          body,
          read: false,
          createdAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
          userId: user._id,
          title,
          body,
          tag: "hydration_reminder",
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
        const title = "Habitos pendientes";
        const body = `Tienes ${pending.length} habito${pending.length > 1 ? "s" : ""} pendiente${pending.length > 1 ? "s" : ""} para hoy`;
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "habits_reminder",
          title,
          body,
          read: false,
          actionUrl: "/dashboard/habits",
          createdAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
          userId: user._id,
          title,
          body,
          tag: "habits_reminder",
          actionUrl: "/dashboard/habits",
        });
      }
    }
  },
});

export const checkNutritionLogging = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const todayStart = startOfDay(new Date()).getTime();

    for (const user of users) {
      if (!user.preferences?.notificationsEnabled) continue;
      if (!user.preferences?.activeModules?.includes("nutrition")) continue;

      const meals = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "nutrition")
        )
        .filter((q) => q.gte(q.field("timestamp"), todayStart))
        .collect();

      if (meals.length === 0) {
        const title = "Registro nutricional";
        const body = "No olvides registrar tus comidas de hoy";
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "nutrition_reminder",
          title,
          body,
          read: false,
          actionUrl: "/dashboard/nutrition",
          createdAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
          userId: user._id,
          title,
          body,
          tag: "nutrition_reminder",
          actionUrl: "/dashboard/nutrition",
        });
      } else if (meals.length < 3) {
        const title = "Registro nutricional";
        const body = `Llevas ${meals.length} comida${meals.length > 1 ? "s" : ""} registrada${meals.length > 1 ? "s" : ""} hoy. Recorda registrar las que faltan.`;
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "nutrition_reminder",
          title,
          body,
          read: false,
          actionUrl: "/dashboard/nutrition",
          createdAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
          userId: user._id,
          title,
          body,
          tag: "nutrition_reminder",
          actionUrl: "/dashboard/nutrition",
        });
      }
    }
  },
});

export const checkWorkoutReminder = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const todayStart = startOfDay(new Date()).getTime();

    for (const user of users) {
      if (!user.preferences?.notificationsEnabled) continue;

      // Check if user has an active workout plan
      const activePlan = await ctx.db
        .query("aiPlans")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "workout")
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (!activePlan) continue;

      // Check if already exercised today
      const todayExercises = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "exercise")
        )
        .filter((q) => q.gte(q.field("timestamp"), todayStart))
        .first();

      if (!todayExercises) {
        const title = "Recordatorio de entrenamiento";
        const body = "Hoy toca entrenar! No olvides tu sesion de ejercicio.";
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "workout_reminder",
          title,
          body,
          read: false,
          actionUrl: "/dashboard/fitness",
          createdAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
          userId: user._id,
          title,
          body,
          tag: "workout_reminder",
          actionUrl: "/dashboard/fitness",
        });
      }
    }
  },
});

export const checkMoodCheckin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const todayStart = startOfDay(new Date()).getTime();

    for (const user of users) {
      if (!user.preferences?.notificationsEnabled) continue;
      if (!user.preferences?.activeModules?.includes("mental")) continue;

      const moodEntries = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "mood")
        )
        .filter((q) => q.gte(q.field("timestamp"), todayStart))
        .first();

      if (!moodEntries) {
        const title = "Check-in emocional";
        const body = "No olvides registrar como te sentis hoy";
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "mood_checkin_reminder",
          title,
          body,
          read: false,
          actionUrl: "/dashboard/mental/checkin",
          createdAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
          userId: user._id,
          title,
          body,
          tag: "mood_checkin_reminder",
          actionUrl: "/dashboard/mental/checkin",
        });
      }
    }
  },
});

export const checkSleepReminder = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = new Date();
    const currentHourUTC = now.getUTCHours();

    for (const user of users) {
      if (!user.preferences?.notificationsEnabled) continue;
      if (!user.preferences?.activeModules?.includes("sleep")) continue;

      const bedTime = user.preferences?.bedTime;

      // Check if it's 30 min before bedtime (approximate with hourly check)
      if (bedTime) {
        const [bedH] = bedTime.split(":").map(Number);
        // Convert bedtime to UTC (Argentina is UTC-3)
        const bedHourUTC = (bedH + 3) % 24;
        // Trigger reminder 1 hour before bedtime (since we check hourly)
        const reminderHourUTC = (bedHourUTC - 1 + 24) % 24;

        if (currentHourUTC === reminderHourUTC) {
          // Check if we already sent a reminder today
          const todayStart = startOfDay(now).getTime();
          const existing = await ctx.db
            .query("notifications")
            .withIndex("by_user_time", (q) =>
              q.eq("userId", user._id).gte("createdAt", todayStart)
            )
            .collect();

          const alreadySent = existing.some(
            (n) => n.type === "sleep_bedtime_reminder"
          );

          if (!alreadySent) {
            const title = "Hora de tu rutina de sueno";
            const body = `Es hora de empezar tu rutina de sueno! Tu hora de dormir es a las ${bedTime}.`;
            await ctx.db.insert("notifications", {
              userId: user._id,
              type: "sleep_bedtime_reminder",
              title,
              body,
              read: false,
              actionUrl: "/dashboard/sleep",
              createdAt: Date.now(),
            });
            await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
              userId: user._id,
              title,
              body,
              tag: "sleep_bedtime_reminder",
              actionUrl: "/dashboard/sleep",
            });
          }
        }
      }

      // Morning check: if user hasn't logged sleep from last night (check at 10am ART = 13 UTC)
      if (currentHourUTC === 13) {
        const todayStart = startOfDay(now).getTime();
        const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

        const sleepEntries = await ctx.db
          .query("wellnessEntries")
          .withIndex("by_user_type", (q) =>
            q.eq("userId", user._id).eq("type", "sleep")
          )
          .filter((q) => q.gte(q.field("timestamp"), yesterdayStart))
          .first();

        if (!sleepEntries) {
          // Check if we already sent this reminder today
          const existing = await ctx.db
            .query("notifications")
            .withIndex("by_user_time", (q) =>
              q.eq("userId", user._id).gte("createdAt", todayStart)
            )
            .collect();

          const alreadySent = existing.some(
            (n) => n.type === "sleep_log_reminder"
          );

          if (!alreadySent) {
            const title = "Registra tu sueno";
            const body = "No olvides registrar como dormiste anoche.";
            await ctx.db.insert("notifications", {
              userId: user._id,
              type: "sleep_log_reminder",
              title,
              body,
              read: false,
              actionUrl: "/dashboard/sleep",
              createdAt: Date.now(),
            });
            await ctx.scheduler.runAfter(0, internal.functions.pushNotifications.sendPushNotification, {
              userId: user._id,
              title,
              body,
              tag: "sleep_log_reminder",
              actionUrl: "/dashboard/sleep",
            });
          }
        }
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
