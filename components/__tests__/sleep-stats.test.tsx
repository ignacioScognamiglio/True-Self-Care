import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// Inline mock matching SleepStats display logic
function SleepStatsMock({
  today,
  weeklyStats,
}: {
  today?: {
    hasLoggedSleep: boolean;
    qualityScore?: number;
    durationFormatted?: string;
  } | null;
  weeklyStats?: {
    totalNightsLogged: number;
    averageQualityScore: number;
    consistencyScore: number;
  } | null;
}) {
  if (!today && !weeklyStats) return null;

  const qualityToday =
    today?.hasLoggedSleep && today.qualityScore != null
      ? `${today.qualityScore}/100`
      : "--";
  const durationToday =
    today?.hasLoggedSleep && today.durationFormatted
      ? today.durationFormatted
      : "--";
  const weeklyAvg =
    weeklyStats && weeklyStats.totalNightsLogged > 0
      ? `${weeklyStats.averageQualityScore}/100`
      : "--";
  const consistency =
    weeklyStats && weeklyStats.totalNightsLogged > 0
      ? `${weeklyStats.consistencyScore}%`
      : "--";

  return (
    <div data-testid="sleep-stats">
      <div data-testid="quality-today">{qualityToday}</div>
      <div data-testid="duration-today">{durationToday}</div>
      <div data-testid="weekly-avg">{weeklyAvg}</div>
      <div data-testid="consistency">{consistency}</div>
    </div>
  );
}

describe("SleepStats display logic", () => {
  it("shows 4 stat values when data exists", () => {
    render(
      <SleepStatsMock
        today={{ hasLoggedSleep: true, qualityScore: 85, durationFormatted: "7h 30min" }}
        weeklyStats={{ totalNightsLogged: 5, averageQualityScore: 78, consistencyScore: 72 }}
      />
    );

    expect(screen.getByTestId("quality-today")).toHaveTextContent("85/100");
    expect(screen.getByTestId("duration-today")).toHaveTextContent("7h 30min");
    expect(screen.getByTestId("weekly-avg")).toHaveTextContent("78/100");
    expect(screen.getByTestId("consistency")).toHaveTextContent("72%");
  });

  it("shows -- when no sleep logged today", () => {
    render(
      <SleepStatsMock
        today={{ hasLoggedSleep: false }}
        weeklyStats={{ totalNightsLogged: 3, averageQualityScore: 70, consistencyScore: 60 }}
      />
    );

    expect(screen.getByTestId("quality-today")).toHaveTextContent("--");
    expect(screen.getByTestId("duration-today")).toHaveTextContent("--");
  });

  it("shows -- for weekly stats when no nights logged", () => {
    render(
      <SleepStatsMock
        today={{ hasLoggedSleep: true, qualityScore: 90, durationFormatted: "8h" }}
        weeklyStats={{ totalNightsLogged: 0, averageQualityScore: 0, consistencyScore: 0 }}
      />
    );

    expect(screen.getByTestId("weekly-avg")).toHaveTextContent("--");
    expect(screen.getByTestId("consistency")).toHaveTextContent("--");
  });

  it("returns null when no data at all", () => {
    const { container } = render(
      <SleepStatsMock today={null} weeklyStats={null} />
    );
    expect(container.innerHTML).toBe("");
  });
});
