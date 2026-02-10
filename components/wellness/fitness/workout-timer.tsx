"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const REST_PRESETS = [30, 60, 90, 120, 180];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

interface WorkoutTimerProps {
  mode: "session" | "rest";
  initialSeconds?: number;
  onRestComplete?: () => void;
  isRunning: boolean;
  onSelectRestTime?: (seconds: number) => void;
}

export function WorkoutTimer({
  mode,
  initialSeconds = 60,
  onRestComplete,
  isRunning,
  onSelectRestTime,
}: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element for rest complete alert
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio();
      audio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==";
      audioRef.current = audio;
    }
  }, []);

  // Reset remaining when initialSeconds changes
  useEffect(() => {
    if (mode === "rest") {
      setRemaining(initialSeconds);
    }
  }, [initialSeconds, mode]);

  // Session timer: counts up
  useEffect(() => {
    if (mode !== "session" || !isRunning || paused) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, isRunning, paused]);

  // Rest timer: counts down
  useEffect(() => {
    if (mode !== "rest" || !isRunning || paused) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Play sound alert
          try {
            audioRef.current?.play();
          } catch {
            // Audio may be blocked by browser
          }
          onRestComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, isRunning, paused, onRestComplete]);

  const handleReset = useCallback(() => {
    if (mode === "session") {
      setElapsed(0);
    } else {
      setRemaining(initialSeconds);
    }
  }, [mode, initialSeconds]);

  if (mode === "session") {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-3xl font-bold tabular-nums">
          {formatTime(elapsed)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setPaused(!paused)}
          aria-label={isRunning ? "Pausar sesion" : "Reanudar sesion"}
        >
          {paused ? (
            <Play className="size-4" />
          ) : (
            <Pause className="size-4" />
          )}
        </Button>
      </div>
    );
  }

  // Rest mode
  const isAlmostDone = remaining <= 5 && remaining > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Descanso
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "Reanudar descanso" : "Pausar descanso"}
          >
            {paused ? (
              <Play className="size-3.5" />
            ) : (
              <Pause className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleReset}
            aria-label="Reiniciar descanso"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "text-center font-mono text-4xl font-bold tabular-nums transition-colors",
          isAlmostDone && "animate-pulse text-red-500"
        )}
      >
        {formatTime(remaining)}
      </div>

      {/* Rest time presets */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {REST_PRESETS.map((secs) => (
          <Button
            key={secs}
            variant={initialSeconds === secs ? "default" : "outline"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => onSelectRestTime?.(secs)}
          >
            {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
          </Button>
        ))}
      </div>
    </div>
  );
}
