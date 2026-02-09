import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

// Mock the API module
vi.mock("@/convex/_generated/api", () => ({
  api: {
    functions: {
      nutrition: {
        getTodayNutritionSummaryPublic: "getTodayNutritionSummaryPublic",
      },
    },
  },
}));

import { useQuery } from "convex/react";
import { NutritionStats } from "../wellness/nutrition/nutrition-stats";

const mockUseQuery = vi.mocked(useQuery);

describe("NutritionStats", () => {
  test("renderiza 4 cards de stats con datos", () => {
    mockUseQuery.mockReturnValue({
      totalCalories: 1500,
      totalProtein: 120,
      totalCarbs: 180,
      totalFat: 50,
      mealCount: 3,
      meals: [],
    });

    render(<NutritionStats />);

    expect(screen.getByText("Calorias")).toBeInTheDocument();
    expect(screen.getByText("Proteina")).toBeInTheDocument();
    expect(screen.getByText("Carbohidratos")).toBeInTheDocument();
    expect(screen.getByText("Grasas")).toBeInTheDocument();

    expect(screen.getByText("1500")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  test("muestra 0 cuando no hay datos (query retorna null)", () => {
    mockUseQuery.mockReturnValue(null);

    render(<NutritionStats />);

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(4);
  });

  test("muestra unidades correctas", () => {
    mockUseQuery.mockReturnValue({
      totalCalories: 500,
      totalProtein: 30,
      totalCarbs: 60,
      totalFat: 20,
      mealCount: 1,
      meals: [],
    });

    render(<NutritionStats />);

    expect(screen.getByText("kcal")).toBeInTheDocument();
    const gUnits = screen.getAllByText("g");
    expect(gUnits).toHaveLength(3);
  });
});
