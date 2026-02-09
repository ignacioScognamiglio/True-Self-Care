import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Smoke test", () => {
  it("renders a basic React component", () => {
    function Hello() {
      return <h1>True Self-Care</h1>;
    }

    render(<Hello />);
    expect(screen.getByText("True Self-Care")).toBeInTheDocument();
  });
});
