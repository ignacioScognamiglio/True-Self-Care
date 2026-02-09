import { describe, it, expect } from "vitest";

describe("Wellness water aggregation logic", () => {
  it("sums water entries correctly", () => {
    const entries = [
      { data: { amount: 250 } },
      { data: { amount: 500 } },
      { data: { amount: 150 } },
    ];
    const totalMl = entries.reduce(
      (sum, e) => sum + (e.data?.amount ?? 0),
      0
    );
    expect(totalMl).toBe(900);
  });

  it("handles missing amount gracefully", () => {
    const entries = [
      { data: { amount: 250 } },
      { data: {} },
      { data: { amount: 150 } },
    ];
    const totalMl = entries.reduce(
      (sum, e) => sum + ((e.data as any)?.amount ?? 0),
      0
    );
    expect(totalMl).toBe(400);
  });

  it("groups entries by day correctly", () => {
    const day1 = new Date(2024, 0, 15).getTime(); // local midnight
    const day2 = new Date(2024, 0, 16).getTime();

    const entries = [
      { timestamp: day1 + 1000, data: { amount: 250 } },
      { timestamp: day1 + 5000, data: { amount: 300 } },
      { timestamp: day2 + 1000, data: { amount: 500 } },
    ];

    const dailyMap = new Map<number, number>();
    for (const entry of entries) {
      const startOfDay = new Date(entry.timestamp);
      startOfDay.setHours(0, 0, 0, 0);
      const dayKey = startOfDay.getTime();
      dailyMap.set(
        dayKey,
        (dailyMap.get(dayKey) ?? 0) + (entry.data?.amount ?? 0)
      );
    }

    expect(dailyMap.size).toBe(2);
    expect(dailyMap.get(day1)).toBe(550);
    expect(dailyMap.get(day2)).toBe(500);
  });

  it("builds 7-day history with zero-fill", () => {
    const dailyMap = new Map<number, number>();
    // Only has data for 2 days
    dailyMap.set(1, 2000);
    dailyMap.set(3, 1500);

    const result = [];
    for (let i = 0; i < 7; i++) {
      result.push({ date: i, totalMl: dailyMap.get(i) ?? 0 });
    }

    expect(result).toHaveLength(7);
    expect(result[0].totalMl).toBe(0);
    expect(result[1].totalMl).toBe(2000);
    expect(result[3].totalMl).toBe(1500);
    expect(result[6].totalMl).toBe(0);
  });
});
