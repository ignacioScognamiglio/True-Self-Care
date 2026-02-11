"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Sparkles,
  Apple,
  Dumbbell,
  Brain,
  Moon,
  Droplets,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { analytics } from "@/lib/analytics";
import type { LucideIcon } from "lucide-react";

const moduleInfo: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  skincare: {
    icon: Sparkles,
    color: "text-wellness-skincare",
    bg: "bg-wellness-skincare/15",
    label: "Skincare",
  },
  nutrition: {
    icon: Apple,
    color: "text-wellness-nutrition",
    bg: "bg-wellness-nutrition/15",
    label: "Nutricion",
  },
  fitness: {
    icon: Dumbbell,
    color: "text-wellness-fitness",
    bg: "bg-wellness-fitness/15",
    label: "Fitness",
  },
  mental: {
    icon: Brain,
    color: "text-wellness-mental",
    bg: "bg-wellness-mental/15",
    label: "Salud Mental",
  },
  sleep: {
    icon: Moon,
    color: "text-wellness-sleep",
    bg: "bg-wellness-sleep/15",
    label: "Sueno",
  },
  habits: {
    icon: Droplets,
    color: "text-wellness-hydration",
    bg: "bg-wellness-hydration/15",
    label: "Habitos",
  },
};

const moduleTips: Record<string, string> = {
  skincare:
    "Vamos a trackear tu rutina y correlacionar tu piel con sueno, estres y alimentacion.",
  nutrition:
    "Registra tus comidas con fotos o texto. La IA calculara macros y sugerira mejoras.",
  fitness:
    "Te crearemos planes de entrenamiento adaptativos basados en tu nivel y objetivos.",
  mental:
    "Check-ins diarios de estado de animo y un diario con IA que te ayuda a reflexionar.",
  sleep:
    "Analisis de patrones de sueno y rutinas personalizadas para dormir mejor.",
  habits:
    "Tracking de habitos con rachas, recordatorios e hidratacion. La constancia lo es todo.",
};

interface PlanStepProps {
  modules: string[];
}

export function PlanStep({ modules }: PlanStepProps) {
  const router = useRouter();
  const completeOnboarding = useMutation(
    api.functions.onboarding.completeOnboarding
  );
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeOnboarding();
      analytics.onboardingCompleted(modules);
      router.push("/dashboard");
    } catch {
      setCompleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Tu plan esta listo</h2>
        <p className="text-muted-foreground">
          Hemos configurado {modules.length} modulo
          {modules.length > 1 ? "s" : ""} personalizados para ti.
        </p>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => {
          const info = moduleInfo[mod];
          if (!info) return null;
          const Icon = info.icon;
          return (
            <motion.div
              key={mod}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: modules.indexOf(mod) * 0.1 }}
            >
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${info.bg}`}
                  >
                    <Icon className={`size-4 ${info.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{info.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {moduleTips[mod]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Button
        size="lg"
        onClick={handleComplete}
        disabled={completing}
        className="w-full"
      >
        {completing ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Preparando tu dashboard...
          </>
        ) : (
          "Ir a mi dashboard"
        )}
      </Button>
    </motion.div>
  );
}
