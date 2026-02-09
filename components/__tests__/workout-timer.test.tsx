import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { WorkoutTimer } from "../wellness/fitness/workout-timer";

describe("WorkoutTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("session timer muestra 00:00 inicialmente", () => {
    render(<WorkoutTimer mode="session" isRunning={false} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("session timer cuenta hacia arriba cuando isRunning", () => {
    render(<WorkoutTimer mode="session" isRunning={true} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();

    // Advance one second at a time to allow React state updates
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(screen.getByText("00:03")).toBeInTheDocument();
  });

  test("rest timer muestra tiempo inicial", () => {
    render(
      <WorkoutTimer mode="rest" initialSeconds={90} isRunning={false} />
    );
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  test("rest timer cuenta hacia abajo cuando isRunning", () => {
    render(
      <WorkoutTimer mode="rest" initialSeconds={5} isRunning={true} />
    );
    expect(screen.getByText("00:05")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("00:02")).toBeInTheDocument();
  });

  test("rest timer llama onRestComplete cuando llega a 0", () => {
    const onRestComplete = vi.fn();
    render(
      <WorkoutTimer
        mode="rest"
        initialSeconds={2}
        isRunning={true}
        onRestComplete={onRestComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onRestComplete).toHaveBeenCalledTimes(1);
  });

  test("muestra chips de tiempo de descanso en modo rest", () => {
    render(
      <WorkoutTimer mode="rest" initialSeconds={60} isRunning={false} />
    );
    expect(screen.getByText("30s")).toBeInTheDocument();
    expect(screen.getByText("1m")).toBeInTheDocument();
    expect(screen.getByText("1.5m")).toBeInTheDocument();
    expect(screen.getByText("2m")).toBeInTheDocument();
    expect(screen.getByText("3m")).toBeInTheDocument();
  });
});
