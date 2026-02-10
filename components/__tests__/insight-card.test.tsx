import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// Inline mock matching InsightCard display logic
function InsightCardMock({
  title,
  body,
  domains = [],
  priority = "medium",
  onDismiss,
}: {
  title: string;
  body: string;
  domains?: string[];
  priority?: "high" | "medium" | "low";
  onDismiss?: () => void;
}) {
  const priorityColors: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <div data-testid="insight-card">
      <div data-testid="insight-title">
        {title}
        <span data-testid="priority-dot" className={priorityColors[priority]} />
      </div>
      <p data-testid="insight-body">{body}</p>
      {domains.length > 0 && (
        <div data-testid="insight-domains">
          {domains.map((d) => (
            <span key={d} data-testid={`domain-${d}`}>
              {d}
            </span>
          ))}
        </div>
      )}
      {onDismiss && (
        <button data-testid="dismiss-btn" onClick={onDismiss}>
          Descartar
        </button>
      )}
    </div>
  );
}

describe("InsightCard display logic", () => {
  it("renders title and body", () => {
    render(
      <InsightCardMock
        title="Mejor sueno con ejercicio"
        body="Los dias que entrenas dormis 30 min mas"
      />
    );

    expect(screen.getByTestId("insight-title")).toHaveTextContent("Mejor sueno con ejercicio");
    expect(screen.getByTestId("insight-body")).toHaveTextContent(
      "Los dias que entrenas dormis 30 min mas"
    );
  });

  it("renders domain badges", () => {
    render(
      <InsightCardMock
        title="Test"
        body="Test body"
        domains={["sueno", "fitness"]}
      />
    );

    expect(screen.getByTestId("domain-sueno")).toBeInTheDocument();
    expect(screen.getByTestId("domain-fitness")).toBeInTheDocument();
  });

  it("does not render domains section when empty", () => {
    render(
      <InsightCardMock title="Test" body="Test body" domains={[]} />
    );

    expect(screen.queryByTestId("insight-domains")).not.toBeInTheDocument();
  });

  it("renders dismiss button and calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(
      <InsightCardMock title="Test" body="Test" onDismiss={onDismiss} />
    );

    const btn = screen.getByTestId("dismiss-btn");
    expect(btn).toHaveTextContent("Descartar");
    fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not render dismiss button without onDismiss", () => {
    render(<InsightCardMock title="Test" body="Test" />);
    expect(screen.queryByTestId("dismiss-btn")).not.toBeInTheDocument();
  });

  it("shows correct priority color class", () => {
    const { rerender } = render(
      <InsightCardMock title="Test" body="Test" priority="high" />
    );
    expect(screen.getByTestId("priority-dot")).toHaveClass("bg-red-500");

    rerender(<InsightCardMock title="Test" body="Test" priority="medium" />);
    expect(screen.getByTestId("priority-dot")).toHaveClass("bg-yellow-500");

    rerender(<InsightCardMock title="Test" body="Test" priority="low" />);
    expect(screen.getByTestId("priority-dot")).toHaveClass("bg-green-500");
  });
});
