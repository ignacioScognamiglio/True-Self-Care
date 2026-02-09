"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Phase = "idle" | "countdown" | "inhale" | "hold" | "exhale" | "done";

const TOTAL_CYCLES = 4;
const INHALE_DURATION = 4;
const HOLD_DURATION = 7;
const EXHALE_DURATION = 8;

const PHASE_LABELS: Record<Phase, string> = {
  idle: "Listo?",
  countdown: "",
  inhale: "Inhala...",
  hold: "Mantene...",
  exhale: "Exhala...",
  done: "Completado!",
};

export function BreathingExercise({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const getScale = useCallback(() => {
    if (phase === "inhale") return 1 + (seconds / INHALE_DURATION) * 0.5;
    if (phase === "hold") return 1.5;
    if (phase === "exhale") return 1.5 - (seconds / EXHALE_DURATION) * 0.5;
    return 1;
  }, [phase, seconds]);

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;

    const interval = setInterval(() => {
      if (phase === "countdown") {
        if (countdown <= 1) {
          setPhase("inhale");
          setSeconds(0);
          setCycle(1);
        } else {
          setCountdown((c) => c - 1);
        }
        return;
      }

      const maxDuration =
        phase === "inhale"
          ? INHALE_DURATION
          : phase === "hold"
            ? HOLD_DURATION
            : EXHALE_DURATION;

      if (seconds + 1 >= maxDuration) {
        if (phase === "inhale") {
          setPhase("hold");
          setSeconds(0);
        } else if (phase === "hold") {
          setPhase("exhale");
          setSeconds(0);
        } else if (phase === "exhale") {
          if (cycle >= TOTAL_CYCLES) {
            setPhase("done");
          } else {
            setCycle((c) => c + 1);
            setPhase("inhale");
            setSeconds(0);
          }
        }
      } else {
        setSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, seconds, cycle, countdown]);

  function start() {
    setPhase("countdown");
    setCountdown(3);
    setSeconds(0);
    setCycle(0);
  }

  function reset() {
    setPhase("idle");
    setSeconds(0);
    setCycle(0);
    setCountdown(3);
  }

  const scale = getScale();
  const progress =
    phase === "done"
      ? 100
      : cycle > 0
        ? ((cycle - 1) / TOTAL_CYCLES) * 100
        : 0;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-8">
        {/* Animated circle */}
        <div className="relative flex size-48 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-wellness-mental/20 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          />
          <div className="relative text-center">
            {phase === "countdown" ? (
              <span className="text-5xl font-bold">{countdown}</span>
            ) : (
              <span className="text-lg font-medium">
                {PHASE_LABELS[phase]}
              </span>
            )}
            {(phase === "inhale" || phase === "hold" || phase === "exhale") && (
              <div className="mt-1 text-sm text-muted-foreground">
                {(() => {
                  const max =
                    phase === "inhale"
                      ? INHALE_DURATION
                      : phase === "hold"
                        ? HOLD_DURATION
                        : EXHALE_DURATION;
                  return `${max - seconds}s`;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Cycle progress */}
        {cycle > 0 && phase !== "done" && (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ciclo {cycle}/{TOTAL_CYCLES}</span>
              <span>Respiracion 4-7-8</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Done screen */}
        {phase === "done" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Completaste {TOTAL_CYCLES} ciclos de respiracion 4-7-8
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={reset}>
                Repetir
              </Button>
              {onComplete && (
                <Button onClick={onComplete}>Listo</Button>
              )}
            </div>
          </div>
        )}

        {/* Start button */}
        {phase === "idle" && (
          <Button onClick={start} size="lg">
            Comenzar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
