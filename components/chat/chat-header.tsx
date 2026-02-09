"use client";

import { Bot, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onNewThread: () => void;
  isStreaming: boolean;
}

export function ChatHeader({ onNewThread, isStreaming }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
          <Bot className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Asistente de Bienestar</h2>
          <Badge
            variant={isStreaming ? "secondary" : "outline"}
            className="mt-0.5 text-[10px] px-1.5 py-0"
          >
            <span
              className={`mr-1 inline-block size-1.5 rounded-full ${
                isStreaming ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            {isStreaming ? "Pensando..." : "En linea"}
          </Badge>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onNewThread}>
        <Plus className="size-4" />
        Nueva conversacion
      </Button>
    </div>
  );
}
