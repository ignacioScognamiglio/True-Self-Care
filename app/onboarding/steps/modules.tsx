"use client";

import {
  Sparkles,
  Apple,
  Dumbbell,
  Brain,
  Moon,
  Droplets,
} from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { LucideIcon } from "lucide-react";

const modules: {
  id: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  description: string;
}[] = [
  {
    id: "skincare",
    icon: Sparkles,
    color: "text-wellness-skincare",
    bg: "bg-wellness-skincare/15",
    title: "Skincare",
    description: "Rutinas y analisis de piel con IA",
  },
  {
    id: "nutrition",
    icon: Apple,
    color: "text-wellness-nutrition",
    bg: "bg-wellness-nutrition/15",
    title: "Nutricion",
    description: "Registro de comidas y planes alimentarios",
  },
  {
    id: "fitness",
    icon: Dumbbell,
    color: "text-wellness-fitness",
    bg: "bg-wellness-fitness/15",
    title: "Fitness",
    description: "Planes de entrenamiento adaptativos",
  },
  {
    id: "mental",
    icon: Brain,
    color: "text-wellness-mental",
    bg: "bg-wellness-mental/15",
    title: "Salud Mental",
    description: "Check-ins de animo y diario con IA",
  },
  {
    id: "sleep",
    icon: Moon,
    color: "text-wellness-sleep",
    bg: "bg-wellness-sleep/15",
    title: "Sueno",
    description: "Tracking de sueno y rutinas nocturnas",
  },
  {
    id: "habits",
    icon: Droplets,
    color: "text-wellness-hydration",
    bg: "bg-wellness-hydration/15",
    title: "Habitos",
    description: "Seguimiento de habitos e hidratacion",
  },
];

interface ModulesStepProps {
  selected: string[];
  onSelect: (modules: string[]) => void;
  onNext: () => void;
}

export function ModulesStep({ selected, onSelect, onNext }: ModulesStepProps) {
  const updateModules = useMutation(api.functions.onboarding.updateActiveModules);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((m) => m !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      await updateModules({ activeModules: selected });
      onNext();
    } finally {
      setSaving(false);
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
        <h2 className="text-2xl font-bold">Que pilares te interesan?</h2>
        <p className="text-muted-foreground">
          Selecciona los modulos que quieres activar. Puedes cambiar esto
          despues.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modules.map((mod) => {
          const isSelected = selected.includes(mod.id);
          return (
            <button
              key={mod.id}
              onClick={() => toggle(mod.id)}
              className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${mod.bg}`}
              >
                <mod.icon className={`size-4 ${mod.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{mod.title}</p>
                <p className="text-xs text-muted-foreground">
                  {mod.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={selected.length === 0 || saving}
          className="w-full sm:w-auto"
        >
          Continuar ({selected.length} seleccionados)
        </Button>
      </div>
    </motion.div>
  );
}
