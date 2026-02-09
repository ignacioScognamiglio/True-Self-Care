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

export default crons;
