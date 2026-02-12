"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const USER_MESSAGE =
  "Me siento cansado y estresado, que me pasa?";

const BOT_RESPONSE_PARTS = [
  { text: "Detecte 3 senales conectadas:\n\n", plain: true },
  { text: "Sueno: ", color: "text-wellness-sleep", bold: true },
  { text: "Llevas 3 noches bajo 6h\n", plain: true },
  { text: "Estado de animo: ", color: "text-wellness-mental", bold: true },
  { text: "Estres elevado ultimos 5 dias\n", plain: true },
  { text: "Nutricion: ", color: "text-wellness-nutrition", bold: true },
  { text: "Saltaste 2 comidas esta semana\n\n", plain: true },
  {
    text: "La falta de sueno eleva el cortisol, que aumenta la ansiedad y reduce tu energia. Te sugiero priorizar 8h de sueno esta semana.",
    plain: true,
  },
];

const FULL_BOT_TEXT = BOT_RESPONSE_PARTS.map((p) => p.text).join("");

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

type Phase = "idle" | "user" | "typing" | "bot" | "done";

export function ChatDemo() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [botCharIndex, setBotCharIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startSequence = useCallback(() => {
    if (reduced) return;
    setPhase("user");
    setBotCharIndex(0);

    timerRef.current = setTimeout(() => {
      setPhase("typing");
      timerRef.current = setTimeout(() => {
        setPhase("bot");
      }, 1500);
    }, 1200);
  }, [reduced]);

  // Start initial sequence
  useEffect(() => {
    if (reduced) {
      setPhase("done");
      return;
    }
    const t = setTimeout(startSequence, 800);
    return () => clearTimeout(t);
  }, [reduced, startSequence]);

  // Typewriter effect for bot response
  useEffect(() => {
    if (phase !== "bot") return;
    if (botCharIndex >= FULL_BOT_TEXT.length) {
      const t = setTimeout(() => {
        setPhase("idle");
        setBotCharIndex(0);
        // Restart loop
        const t2 = setTimeout(startSequence, 2000);
        timerRef.current = t2;
      }, 4000);
      timerRef.current = t;
      return;
    }
    const t = setTimeout(() => setBotCharIndex((i) => i + 1), 18);
    return () => clearTimeout(t);
  }, [phase, botCharIndex, startSequence]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const renderBotText = (maxChars: number) => {
    let charsSoFar = 0;
    return BOT_RESPONSE_PARTS.map((part, i) => {
      const start = charsSoFar;
      charsSoFar += part.text.length;
      if (start >= maxChars) return null;
      const visibleLen = Math.min(part.text.length, maxChars - start);
      const visibleText = part.text.slice(0, visibleLen);
      if (part.bold && part.color) {
        return (
          <span key={i} className={`font-semibold ${part.color}`}>
            {visibleText}
          </span>
        );
      }
      return <span key={i}>{visibleText}</span>;
    });
  };

  const showUser = phase === "user" || phase === "typing" || phase === "bot" || phase === "done";
  const showTyping = phase === "typing";
  const showBot = phase === "bot" || phase === "done";

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </div>
        <span className="text-sm font-medium">Asistente IA</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          Cross-domain
        </Badge>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[280px]">
        {/* User message */}
        {showUser && (
          <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm">
                {USER_MESSAGE}
              </div>
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="size-3" />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {showTyping && (
          <div className="flex items-start gap-2 animate-in fade-in duration-300">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="size-3" />
            </div>
            <div className="rounded-2xl bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Bot response */}
        {showBot && (
          <div className="flex items-start gap-2 animate-in fade-in duration-300">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="size-3" />
            </div>
            <div className="rounded-2xl bg-muted px-4 py-2 max-w-[85%] text-sm whitespace-pre-line">
              {phase === "done"
                ? renderBotText(FULL_BOT_TEXT.length)
                : renderBotText(botCharIndex)}
              {phase === "bot" && botCharIndex < FULL_BOT_TEXT.length && (
                <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
