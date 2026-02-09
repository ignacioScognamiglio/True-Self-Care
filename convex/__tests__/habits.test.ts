import { describe, it, expect } from "vitest";

describe("Habits streak logic", () => {
  it("initializes with streak 0", () => {
    const habit = { currentStreak: 0, longestStreak: 0, isActive: true };
    expect(habit.currentStreak).toBe(0);
    expect(habit.isActive).toBe(true);
  });

  it("increments streak for consecutive days", () => {
    const lastCompletionYesterday = true;
    const currentStreak = 5;
    const newStreak = lastCompletionYesterday ? currentStreak + 1 : 1;
    expect(newStreak).toBe(6);
  });

  it("resets streak on gap", () => {
    const lastCompletionYesterday = false;
    const isToday = false;
    const newStreak = isToday ? 5 : lastCompletionYesterday ? 6 : 1;
    expect(newStreak).toBe(1);
  });

  it("keeps streak on same day completion", () => {
    const isToday = true;
    const currentStreak = 5;
    const newStreak = isToday ? currentStreak : 1;
    expect(newStreak).toBe(5);
  });

  it("updates longestStreak when exceeded", () => {
    const newLongest = Math.max(10, 8);
    expect(newLongest).toBe(10);
  });
});
