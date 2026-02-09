"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  useUIMessages,
  optimisticallySendMessage,
} from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

const SUGGESTIONS = [
  "Quiero crear un nuevo habito",
  "Cuanta agua debo tomar hoy?",
  "Ayudame a mantener mis streaks",
  "Que habitos me recomiendas?",
] as const;

export function ChatContainer() {
  const threads = useQuery(api.chat.getUserThreads);
  const createThread = useMutation(api.chat.createThread);
  const sendMessage = useMutation(
    api.chat.initiateStream
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listThreadMessages)
  );

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Set initial active thread from user threads
  useEffect(() => {
    if (threads && threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0]._id);
    }
  }, [threads, activeThreadId]);

  const messagesResult = useUIMessages(
    api.chat.listThreadMessages,
    activeThreadId ? { threadId: activeThreadId } : "skip",
    { initialNumItems: 20, stream: true }
  );

  const messages = messagesResult.results;
  const isStreaming = messages.some((m) => m.status === "streaming");

  // Auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(
    async (prompt: string) => {
      let threadId = activeThreadId;

      if (!threadId) {
        threadId = await createThread();
        setActiveThreadId(threadId);
      }

      await sendMessage({ threadId, prompt });
    },
    [activeThreadId, createThread, sendMessage]
  );

  const handleNewThread = useCallback(async () => {
    const threadId = await createThread();
    setActiveThreadId(threadId);
  }, [createThread]);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader onNewThread={handleNewThread} isStreaming={isStreaming} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {activeThreadId && messages.length > 0 ? (
          <div className="flex flex-col py-2">
            {messages.map((message) => (
              <ChatMessage key={message.key} message={message} />
            ))}
          </div>
        ) : (
          <EmptyState onSuggestionClick={handleSend} />
        )}
      </div>

      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}

function EmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (message: string) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-8 text-muted-foreground" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Hola! Soy tu asistente de bienestar
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Preguntame lo que quieras sobre tus habitos y bienestar
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="h-auto whitespace-normal px-3 py-2.5 text-left text-xs leading-snug"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <Sparkles className="mr-1.5 size-3 shrink-0 text-primary" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
