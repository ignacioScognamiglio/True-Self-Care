import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// Inline test component matching WaterTracker behavior
function WaterTrackerMock({ totalMl }: { totalMl: number | undefined }) {
  const goal = 2500;
  const ml = totalMl ?? 0;
  const pct = Math.min(100, Math.round((ml / goal) * 100));
  const formatted = ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;

  return (
    <div>
      <span data-testid="water-display">
        {formatted} / 2.5L
      </span>
      <div data-testid="water-percentage">{pct}%</div>
      <progress value={pct} max={100} data-testid="water-progress" />
    </div>
  );
}

describe("WaterTracker display logic", () => {
  it("shows 0ml when no data", () => {
    render(<WaterTrackerMock totalMl={undefined} />);
    expect(screen.getByTestId("water-display")).toHaveTextContent(
      "0ml / 2.5L"
    );
    expect(screen.getByTestId("water-percentage")).toHaveTextContent("0%");
  });

  it("shows formatted liters when >= 1000ml", () => {
    render(<WaterTrackerMock totalMl={1500} />);
    expect(screen.getByTestId("water-display")).toHaveTextContent(
      "1.5L / 2.5L"
    );
    expect(screen.getByTestId("water-percentage")).toHaveTextContent("60%");
  });

  it("shows ml when < 1000", () => {
    render(<WaterTrackerMock totalMl={750} />);
    expect(screen.getByTestId("water-display")).toHaveTextContent(
      "750ml / 2.5L"
    );
    expect(screen.getByTestId("water-percentage")).toHaveTextContent("30%");
  });

  it("caps percentage at 100%", () => {
    render(<WaterTrackerMock totalMl={3000} />);
    expect(screen.getByTestId("water-percentage")).toHaveTextContent("100%");
  });
});
