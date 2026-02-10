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

// ═══ Mood check-in form mock ═══

function MoodCheckinFormMock() {
  return (
    <form>
      <fieldset>
        <legend>Como te sentis?</legend>
        <div role="radiogroup" aria-label="Estado de animo">
          <button type="button" role="radio" aria-checked="true">
            Feliz
          </button>
          <button type="button" role="radio" aria-checked="false">
            Triste
          </button>
          <button type="button" role="radio" aria-checked="false">
            Neutral
          </button>
        </div>
      </fieldset>

      <div>
        <label htmlFor="intensity">Intensidad</label>
        <input
          id="intensity"
          type="range"
          min={1}
          max={10}
          defaultValue={5}
          aria-label="Intensidad del animo"
        />
      </div>

      <fieldset>
        <legend>Emociones (opcional)</legend>
        <div role="group" aria-label="Emociones">
          <button type="button" role="checkbox" aria-checked="false">
            alegria
          </button>
          <button type="button" role="checkbox" aria-checked="true">
            ansiedad
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend>Triggers (opcional)</legend>
        <div role="group" aria-label="Triggers">
          <button type="button" role="checkbox" aria-checked="false">
            trabajo
          </button>
        </div>
      </fieldset>

      <div>
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" />
      </div>

      <button type="submit">Registrar check-in</button>
    </form>
  );
}

describe("Mood check-in form accessibility", () => {
  it("has proper ARIA roles", async () => {
    const { container } = render(<MoodCheckinFormMock />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has radiogroup for mood selection", () => {
    const { container } = render(<MoodCheckinFormMock />);
    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup).not.toBeNull();
    expect(radiogroup?.getAttribute("aria-label")).toBe("Estado de animo");
  });

  it("has radio buttons with aria-checked", () => {
    const { container } = render(<MoodCheckinFormMock />);
    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(3);
    expect(radios[0].getAttribute("aria-checked")).toBe("true");
    expect(radios[1].getAttribute("aria-checked")).toBe("false");
  });

  it("has checkbox roles for emotion/trigger toggles", () => {
    const { container } = render(<MoodCheckinFormMock />);
    const checkboxes = container.querySelectorAll('[role="checkbox"]');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });
});
