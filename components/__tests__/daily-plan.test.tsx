import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// ═══ TYPES ═══

interface DailyPlanSection {
  period: "morning" | "afternoon" | "evening";
  label: string;
  icon: string;
  items: Array<{
    id: string;
    text: string;
    domain: string;
    completed: boolean;
  }>;
}

interface DailyPlanContent {
  title: string;
  generatedAt: number;
  sections: DailyPlanSection[];
  insights: string[];
}

// ═══ INLINE MOCK COMPONENT ═══

function DailyPlanMock({
  plan,
  onToggle,
}: {
  plan: DailyPlanContent | null;
  onToggle?: (sectionIdx: number, itemIdx: number) => void;
}) {
  if (!plan) {
    return (
      <div data-testid="empty-state">
        Sin plan diario
      </div>
    );
  }

  const totalItems = plan.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const completedItems = plan.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.completed).length,
    0
  );

  return (
    <div data-testid="daily-plan">
      <h3 data-testid="plan-title">{plan.title}</h3>
      <span data-testid="ai-badge">Generado por IA</span>
      <span data-testid="progress">
        {completedItems}/{totalItems}
      </span>

      {plan.sections.map((section, sIdx) => (
        <div key={section.period} data-testid={`section-${section.period}`}>
          <h4>{section.label}</h4>
          {section.items.map((item, iIdx) => (
            <div key={item.id} data-testid={`item-${item.id}`}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggle?.(sIdx, iIdx)}
                data-testid={`checkbox-${item.id}`}
              />
              <span
                style={{
                  textDecoration: item.completed ? "line-through" : "none",
                }}
              >
                {item.text}
              </span>
              <span data-testid={`domain-${item.id}`}>{item.domain}</span>
            </div>
          ))}
        </div>
      ))}

      {plan.insights.length > 0 && (
        <div data-testid="insights-section">
          {plan.insights.map((insight, i) => (
            <p key={i}>{insight}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ TEST DATA ═══

const samplePlan: DailyPlanContent = {
  title: "Tu plan para hoy - Lunes 10/02",
  generatedAt: Date.now(),
  sections: [
    {
      period: "morning",
      label: "Manana (6:00 - 12:00)",
      icon: "sun",
      items: [
        { id: "m1", text: "Tomar 500ml de agua", domain: "hydration", completed: false },
        { id: "m2", text: "Desayuno: avena con frutas", domain: "nutrition", completed: true },
      ],
    },
    {
      period: "afternoon",
      label: "Tarde (12:00 - 18:00)",
      icon: "sunset",
      items: [
        { id: "a1", text: "Press banca 4x10", domain: "fitness", completed: false },
      ],
    },
    {
      period: "evening",
      label: "Noche (18:00 - 23:00)",
      icon: "moon",
      items: [
        { id: "e1", text: "Meditacion 10 min", domain: "mental", completed: false },
        { id: "e2", text: "Rutina de sueno", domain: "sleep", completed: false },
      ],
    },
  ],
  insights: ["Dormir bien mejora tu rendimiento en el gym"],
};

// ═══ TESTS ═══

describe("DailyPlan display logic", () => {
  it("renders 3 sections: morning, afternoon, evening", () => {
    render(<DailyPlanMock plan={samplePlan} />);

    expect(screen.getByTestId("section-morning")).toBeInTheDocument();
    expect(screen.getByTestId("section-afternoon")).toBeInTheDocument();
    expect(screen.getByTestId("section-evening")).toBeInTheDocument();
  });

  it("renders all items with correct text", () => {
    render(<DailyPlanMock plan={samplePlan} />);

    expect(screen.getByTestId("item-m1")).toHaveTextContent("Tomar 500ml de agua");
    expect(screen.getByTestId("item-m2")).toHaveTextContent("Desayuno: avena con frutas");
    expect(screen.getByTestId("item-a1")).toHaveTextContent("Press banca 4x10");
    expect(screen.getByTestId("item-e1")).toHaveTextContent("Meditacion 10 min");
    expect(screen.getByTestId("item-e2")).toHaveTextContent("Rutina de sueno");
  });

  it("shows progress (completed/total)", () => {
    render(<DailyPlanMock plan={samplePlan} />);
    // 1 item completed out of 5 total
    expect(screen.getByTestId("progress")).toHaveTextContent("1/5");
  });

  it("shows 'Generado por IA' badge", () => {
    render(<DailyPlanMock plan={samplePlan} />);
    expect(screen.getByTestId("ai-badge")).toHaveTextContent("Generado por IA");
  });

  it("calls onToggle when checkbox clicked", () => {
    const onToggle = vi.fn();
    render(<DailyPlanMock plan={samplePlan} onToggle={onToggle} />);

    fireEvent.click(screen.getByTestId("checkbox-m1"));
    expect(onToggle).toHaveBeenCalledWith(0, 0);

    fireEvent.click(screen.getByTestId("checkbox-a1"));
    expect(onToggle).toHaveBeenCalledWith(1, 0);
  });

  it("shows empty state when no plan", () => {
    render(<DailyPlanMock plan={null} />);
    expect(screen.getByTestId("empty-state")).toHaveTextContent("Sin plan diario");
    expect(screen.queryByTestId("daily-plan")).not.toBeInTheDocument();
  });

  it("renders insights section", () => {
    render(<DailyPlanMock plan={samplePlan} />);
    expect(screen.getByTestId("insights-section")).toHaveTextContent(
      "Dormir bien mejora tu rendimiento en el gym"
    );
  });

  it("hides insights section when empty", () => {
    const planNoInsights = { ...samplePlan, insights: [] };
    render(<DailyPlanMock plan={planNoInsights} />);
    expect(screen.queryByTestId("insights-section")).not.toBeInTheDocument();
  });

  it("shows domain labels for each item", () => {
    render(<DailyPlanMock plan={samplePlan} />);
    expect(screen.getByTestId("domain-m1")).toHaveTextContent("hydration");
    expect(screen.getByTestId("domain-a1")).toHaveTextContent("fitness");
    expect(screen.getByTestId("domain-e1")).toHaveTextContent("mental");
  });

  it("renders plan title", () => {
    render(<DailyPlanMock plan={samplePlan} />);
    expect(screen.getByTestId("plan-title")).toHaveTextContent(
      "Tu plan para hoy - Lunes 10/02"
    );
  });
});
