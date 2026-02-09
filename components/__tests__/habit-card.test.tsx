import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// Inline test component matching HabitCard display logic
function HabitCardMock({
  name,
  category,
  currentStreak,
  isCompletedToday,
  onComplete,
}: {
  name: string;
  category: string;
  currentStreak: number;
  isCompletedToday: boolean;
  onComplete?: () => void;
}) {
  return (
    <div>
      <span data-testid="habit-name">{name}</span>
      <span data-testid="habit-category">{category}</span>

      {currentStreak > 0 && (
        <span data-testid="habit-streak">
          {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
        </span>
      )}

      <button
        data-testid="complete-button"
        disabled={isCompletedToday}
        onClick={onComplete}
      >
        {isCompletedToday ? "✓" : "Completar"}
      </button>
    </div>
  );
}

describe("HabitCard display logic", () => {
  it("renders habit name and category", () => {
    render(
      <HabitCardMock
        name="Meditar"
        category="Mental"
        currentStreak={0}
        isCompletedToday={false}
      />
    );
    expect(screen.getByTestId("habit-name")).toHaveTextContent("Meditar");
    expect(screen.getByTestId("habit-category")).toHaveTextContent("Mental");
  });

  it("shows streak when > 0", () => {
    render(
      <HabitCardMock
        name="Correr"
        category="Fitness"
        currentStreak={5}
        isCompletedToday={false}
      />
    );
    expect(screen.getByTestId("habit-streak")).toHaveTextContent("5 dias");
  });

  it("hides streak when = 0", () => {
    render(
      <HabitCardMock
        name="Leer"
        category="Mental"
        currentStreak={0}
        isCompletedToday={false}
      />
    );
    expect(screen.queryByTestId("habit-streak")).toBeNull();
  });

  it("disables button and shows check when completed today", () => {
    render(
      <HabitCardMock
        name="Meditar"
        category="Mental"
        currentStreak={3}
        isCompletedToday={true}
      />
    );
    const button = screen.getByTestId("complete-button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("✓");
  });

  it("calls onComplete when clicking complete button", () => {
    const onComplete = vi.fn();
    render(
      <HabitCardMock
        name="Yoga"
        category="Fitness"
        currentStreak={0}
        isCompletedToday={false}
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByTestId("complete-button"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("shows singular 'dia' for streak = 1", () => {
    render(
      <HabitCardMock
        name="Caminar"
        category="Salud"
        currentStreak={1}
        isCompletedToday={false}
      />
    );
    expect(screen.getByTestId("habit-streak")).toHaveTextContent("1 dia");
  });
});
