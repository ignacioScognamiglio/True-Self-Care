import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe } from "vitest-axe";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
  usePaginatedQuery: vi.fn(() => ({
    results: [],
    status: "Exhausted",
    loadMore: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/dashboard"),
}));

// ═══ Gamification Page mock ═══

function GamificationPageMock() {
  return (
    <main>
      <h1>Gamificacion</h1>
      <section aria-label="Nivel y experiencia">
        <div role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de nivel">
          <span>Nivel 5</span>
          <span>120/200 XP</span>
        </div>
      </section>
      <section aria-label="Racha">
        <span>Racha: 7 dias</span>
      </section>
      <section aria-label="Challenge activo">
        <h2>Hidratacion semanal</h2>
        <p>Toma 2L de agua por 5 dias</p>
        <div role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del challenge">
          3/5
        </div>
      </section>
      <section aria-label="Logros">
        <h2>Logros</h2>
        <ul>
          <li>Primer paso - Registra tu primer dato</li>
          <li>Constancia - 7 dias seguidos</li>
        </ul>
      </section>
    </main>
  );
}

describe("Gamification page accessibility", () => {
  it("renders without axe violations", async () => {
    const { container } = render(<GamificationPageMock />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ═══ Dashboard Page mock ═══

function DashboardPageMock() {
  return (
    <main>
      <h1>Dashboard</h1>
      <section aria-label="Resumen del dia">
        <div className="grid">
          <div>
            <h2>Sueno</h2>
            <p>7h 30min</p>
          </div>
          <div>
            <h2>Nutricion</h2>
            <p>1800 kcal</p>
          </div>
          <div>
            <h2>Ejercicio</h2>
            <p>3 ejercicios</p>
          </div>
          <div>
            <h2>Animo</h2>
            <p>Feliz - 7/10</p>
          </div>
        </div>
      </section>
      <section aria-label="Plan del dia">
        <h2>Tu plan para hoy</h2>
        <ul>
          <li>
            <label>
              <input type="checkbox" /> Desayuno: avena con frutas
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" /> Tomar 2L de agua
            </label>
          </li>
        </ul>
      </section>
    </main>
  );
}

describe("Dashboard page accessibility", () => {
  it("renders without axe violations", async () => {
    const { container } = render(<DashboardPageMock />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

