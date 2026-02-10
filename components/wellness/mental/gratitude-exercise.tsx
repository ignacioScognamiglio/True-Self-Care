"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const STEPS = [
  {
    title: "Paso 1 de 3",
    question: "Algo pequeno que te hizo sonreir hoy",
    placeholder: "Un cafe caliente, un mensaje lindo, sol en la ventana...",
  },
  {
    title: "Paso 2 de 3",
    question: "Una persona que aprecies en tu vida",
    placeholder: "Alguien que te apoyo, te escucho, o simplemente esta ahi...",
  },
  {
    title: "Paso 3 de 3",
    question: "Algo de ti mismo/a que valores",
    placeholder: "Una cualidad, algo que hiciste bien, tu esfuerzo...",
  },
] as const;

export function GratitudeExercise({ onComplete }: { onComplete?: () => void }) {
  const createEntry = useMutation(api.functions.mental.createJournalEntryPublic);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [isDone, setIsDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function updateAnswer(value: string) {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
  }

  async function handleNext() {
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Save as journal entry
    setIsSaving(true);
    try {
      const content = STEPS.map(
        (s, i) => `**${s.question}**\n${answers[i]}`
      ).join("\n\n");

      await createEntry({
        journal: {
          title: "Ejercicio de gratitud",
          content,
          tags: ["gratitud", "ejercicio"],
        },
      });
      toast.success("Ejercicio de gratitud guardado en tu journal");
      setIsDone(true);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  }

  if (isDone) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <span className="text-4xl">🙏</span>
          <h3 className="text-lg font-semibold">Ejercicio completado</h3>
          <p className="text-center text-sm text-muted-foreground">
            La gratitud se fortalece con la practica. Se guardo como entrada en
            tu journal.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep(0);
                setAnswers(["", "", ""]);
                setIsDone(false);
              }}
            >
              Repetir
            </Button>
            {onComplete && <Button onClick={onComplete}>Listo</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStep = STEPS[step];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {currentStep.title}
          </CardTitle>
          <span className="text-xs text-muted-foreground">Gratitud</span>
        </div>
        <Progress value={((step + 1) / 3) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-medium">{currentStep.question}</h3>
        <Textarea
          placeholder={currentStep.placeholder}
          value={answers[step]}
          onChange={(e) => updateAnswer(e.target.value)}
          rows={4}
        />
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[step].trim() || isSaving}
          >
            {step < 2 ? "Siguiente" : isSaving ? "Guardando..." : "Finalizar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
