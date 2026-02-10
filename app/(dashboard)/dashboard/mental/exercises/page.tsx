"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Heart, Lightbulb, ArrowLeft } from "lucide-react";
import { MentalHealthDisclaimer } from "@/components/wellness/mental/mental-health-disclaimer";
import { BreathingExercise } from "@/components/wellness/mental/breathing-exercise";
import { GratitudeExercise } from "@/components/wellness/mental/gratitude-exercise";
import { ReframingExercise } from "@/components/wellness/mental/reframing-exercise";

type ExerciseType = "breathing" | "gratitude" | "reframing" | null;

const EXERCISES = [
  {
    type: "breathing" as const,
    title: "Respiracion 4-7-8",
    description:
      "Tecnica de respiracion que activa el sistema nervioso parasimpatico. Reduce ansiedad y promueve la calma.",
    duration: "~2 min",
    icon: Wind,
    color: "text-blue-500",
  },
  {
    type: "gratitude" as const,
    title: "Gratitud",
    description:
      "Identifica 3 cosas por las que estar agradecido/a. La gratitud activa circuitos de recompensa y mejora el bienestar.",
    duration: "3-5 min",
    icon: Heart,
    color: "text-pink-500",
  },
  {
    type: "reframing" as const,
    title: "Reframing Cognitivo",
    description:
      "Registro de pensamientos CBT: identifica y reestructura pensamientos automaticos negativos con evidencia.",
    duration: "5-10 min",
    icon: Lightbulb,
    color: "text-amber-500",
  },
] as const;

export default function ExercisesPage() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ejercicios guiados
          </h2>
          <p className="text-muted-foreground">
            Tecnicas de bienestar basadas en evidencia
          </p>
        </div>
        {activeExercise && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveExercise(null)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver
          </Button>
        )}
      </div>

      <MentalHealthDisclaimer />

      {activeExercise === "breathing" && (
        <BreathingExercise onComplete={() => setActiveExercise(null)} />
      )}

      {activeExercise === "gratitude" && (
        <GratitudeExercise onComplete={() => setActiveExercise(null)} />
      )}

      {activeExercise === "reframing" && (
        <ReframingExercise onComplete={() => setActiveExercise(null)} />
      )}

      {!activeExercise && (
        <div className="grid gap-4 md:grid-cols-3">
          {EXERCISES.map((exercise) => (
            <Card
              key={exercise.type}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setActiveExercise(exercise.type)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <exercise.icon className={`size-5 ${exercise.color}`} />
                  {exercise.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {exercise.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Duracion: {exercise.duration}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
