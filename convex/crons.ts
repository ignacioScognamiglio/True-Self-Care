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

export default crons;
