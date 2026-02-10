import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "hydration-reminder",
  { hours: 2 },
  internal.reminders.checkHydration
);

crons.daily(
  "habits-evening-reminder",
  { hourUTC: 1, minuteUTC: 0 },
  internal.reminders.checkPendingHabits
);

crons.daily(
  "streak-reset",
  { hourUTC: 3, minuteUTC: 0 },
  internal.reminders.resetMissedStreaks
);

crons.daily(
  "nutrition-lunch-reminder",
  { hourUTC: 15, minuteUTC: 0 },
  internal.reminders.checkNutritionLogging
);

crons.daily(
  "nutrition-dinner-reminder",
  { hourUTC: 22, minuteUTC: 0 },
  internal.reminders.checkNutritionLogging
);

crons.daily(
  "workout-reminder",
  { hourUTC: 21, minuteUTC: 0 },
  internal.reminders.checkWorkoutReminder
);

crons.daily(
  "mood-checkin-reminder",
  { hourUTC: 23, minuteUTC: 0 },
  internal.reminders.checkMoodCheckin
);

// Google Fit sync - cada 6 horas para usuarios conectados
crons.interval(
  "google-fit-sync",
  { hours: 6 },
  internal.functions.googleFit.syncAllUsers
);

// Daily Plan - generar a las 6am Argentina (UTC-3 = 9 UTC)
crons.daily(
  "daily-plan-generation",
  { hourUTC: 9, minuteUTC: 0 },
  internal.functions.dailyPlan.generateDailyPlan
);

// Weekly Summary - generar domingos a las 9am Argentina (UTC-3 = 12 UTC)
crons.weekly(
  "weekly-summary-generation",
  { dayOfWeek: "sunday", hourUTC: 12, minuteUTC: 0 },
  internal.functions.dailyPlan.generateWeeklySummary
);

// Sleep reminder - verificar cada hora si es momento de recordar
crons.interval(
  "sleep-reminder",
  { hours: 1 },
  internal.reminders.checkSleepReminder
);

// Streak freeze semanal: lunes 10:00 UTC (7am ART)
crons.weekly(
  "earn-streak-freeze",
  { dayOfWeek: "monday", hourUTC: 10, minuteUTC: 0 },
  internal.functions.gamification.earnStreakFreezeAll
);

// Challenge semanal: lunes 11:00 UTC (8am ART)
crons.weekly(
  "generate-weekly-challenge",
  { dayOfWeek: "monday", hourUTC: 11, minuteUTC: 0 },
  internal.functions.challenges.generateWeeklyChallengeAll
);

export default crons;
