import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock convex/react
vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

// Mock the API module
vi.mock("@/convex/_generated/api", () => ({
  api: {
    functions: {
      nutrition: {
        logMealEntryPublic: "logMealEntryPublic",
      },
    },
  },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { MealLogForm } from "../wellness/nutrition/meal-log-form";

describe("MealLogForm", () => {
  test("renderiza todos los campos del formulario", () => {
    render(<MealLogForm />);

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Calorias (kcal)")).toBeInTheDocument();
    expect(screen.getByLabelText("Proteina (g)")).toBeInTheDocument();
    expect(screen.getByLabelText("Carbohidratos (g)")).toBeInTheDocument();
    expect(screen.getByLabelText("Grasas (g)")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Descripcion (opcional)")
    ).toBeInTheDocument();
  });

  test("muestra boton 'Registrar comida'", () => {
    render(<MealLogForm />);

    expect(
      screen.getByRole("button", { name: "Registrar comida" })
    ).toBeInTheDocument();
  });

  test("muestra boton 'Cancelar' cuando se pasa onCancel", () => {
    render(<MealLogForm onCancel={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();
  });

  test("no muestra boton 'Cancelar' sin onCancel", () => {
    render(<MealLogForm />);

    expect(
      screen.queryByRole("button", { name: "Cancelar" })
    ).not.toBeInTheDocument();
  });

  test("llama onCancel al hacer click en Cancelar", async () => {
    const onCancel = vi.fn();
    render(<MealLogForm onCancel={onCancel} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
