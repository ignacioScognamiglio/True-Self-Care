"use client";

import { User, Bot, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SmoothText, type UIMessage } from "@convex-dev/agent/react";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "failed";

  const timestamp = new Date(message._creationTime).toLocaleTimeString(
    "es-AR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md",
            isError && "border border-destructive/30 bg-destructive/5"
          )}
        >
          {isError && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3" />
              Error al generar respuesta
            </div>
          )}

          {isUser ? (
            <span>{message.text}</span>
          ) : (
            <span>
              <SmoothText text={message.text} startStreaming={isStreaming} />
              {isStreaming && (
                <span className="ml-0.5 inline-block size-2 animate-pulse rounded-full bg-current align-middle" />
              )}
            </span>
          )}
        </div>

        <span className="px-1 text-[10px] text-muted-foreground">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
