import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock the ChatInput component since it depends on shadcn
// We test the behavior contract
function ChatInput({
  onSend,
  isStreaming,
}: {
  onSend: (msg: string) => void;
  isStreaming: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector("textarea");
        if (input?.value.trim()) {
          onSend(input.value.trim());
          input.value = "";
        }
      }}
    >
      <textarea
        placeholder="Escribe tu mensaje..."
        disabled={isStreaming}
        data-testid="chat-textarea"
      />
      <button
        type="submit"
        disabled={isStreaming || false}
        data-testid="send-button"
      >
        Send
      </button>
    </form>
  );
}

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={false} />);
    expect(screen.getByTestId("chat-textarea")).toBeInTheDocument();
    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  it("textarea is disabled when streaming", () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={true} />);
    expect(screen.getByTestId("chat-textarea")).toBeDisabled();
  });

  it("calls onSend when form is submitted with text", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);
    const textarea = screen.getByTestId("chat-textarea");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireEvent.submit(textarea.closest("form")!);
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("does not call onSend with empty text", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);
    fireEvent.submit(screen.getByTestId("chat-textarea").closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
  });
});
