"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const EMOTIONS = [
  "ansiedad",
  "tristeza",
  "ira",
  "frustracion",
  "culpa",
  "verguenza",
  "miedo",
  "desesperanza",
] as const;

const STEPS = [
  {
    title: "Paso 1: Situacion",
    question: "Describe la situacion que te afecta",
    placeholder: "Que paso? Donde estabas? Con quien?",
  },
  {
    title: "Paso 2: Pensamiento automatico",
    question: "Cual fue el primer pensamiento que tuviste?",
    placeholder: "Ej: 'Siempre me sale todo mal', 'Nadie me quiere'...",
  },
  {
    title: "Paso 3: Emocion e intensidad",
    question: "Que emocion sentiste y con que intensidad?",
    placeholder: "",
    isEmotionStep: true,
  },
  {
    title: "Paso 4: Evidencia a favor",
    question: "Que evidencia apoya este pensamiento?",
    placeholder: "Hechos concretos (no interpretaciones) que lo respaldan...",
  },
  {
    title: "Paso 5: Evidencia en contra",
    question: "Que evidencia contradice este pensamiento?",
    placeholder: "Momentos donde lo opuesto fue cierto, excepciones...",
  },
  {
    title: "Paso 6: Pensamiento alternativo",
    question: "Formula un pensamiento mas equilibrado",
    placeholder:
      "Un pensamiento que considere ambas evidencias, mas balanceado...",
  },
  {
    title: "Paso 7: Reevaluacion",
    question: "Con este nuevo pensamiento, cual es la intensidad ahora?",
    placeholder: "",
    isReevalStep: true,
  },
] as const;

export function ReframingExercise({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const createEntry = useMutation(api.functions.mental.createJournalEntryPublic);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(7).fill(""));
  const [emotion, setEmotion] = useState<string>("");
  const [initialIntensity, setInitialIntensity] = useState([5]);
  const [finalIntensity, setFinalIntensity] = useState([5]);
  const [isDone, setIsDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function updateAnswer(value: string) {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
  }

  function canProceed() {
    const currentStep = STEPS[step];
    if ("isEmotionStep" in currentStep && currentStep.isEmotionStep)
      return !!emotion;
    if ("isReevalStep" in currentStep && currentStep.isReevalStep) return true;
    return !!answers[step].trim();
  }

  async function handleNext() {
    if (step < 6) {
      setStep(step + 1);
      return;
    }

    setIsSaving(true);
    try {
      const content = `**Situacion:** ${answers[0]}

**Pensamiento automatico:** ${answers[1]}

**Emocion:** ${emotion} (intensidad: ${initialIntensity[0]}/10)

**Evidencia a favor:** ${answers[3]}

**Evidencia en contra:** ${answers[4]}

**Pensamiento alternativo:** ${answers[5]}

**Reevaluacion:** Intensidad ${finalIntensity[0]}/10 (antes: ${initialIntensity[0]}/10)`;

      await createEntry({
        journal: {
          title: "Reframing cognitivo",
          content,
          tags: ["reframing", "cbt", "ejercicio"],
        },
      });
      toast.success("Reframing guardado en tu journal");
      setIsDone(true);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  }

  if (isDone) {
    const change = initialIntensity[0] - finalIntensity[0];
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <span className="text-4xl">💡</span>
          <h3 className="text-lg font-semibold">Ejercicio completado</h3>
          {change > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Tu intensidad emocional bajo de {initialIntensity[0]} a{" "}
              {finalIntensity[0]} — eso es progreso.
            </p>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Se guardo como entrada en tu journal.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep(0);
                setAnswers(Array(7).fill(""));
                setEmotion("");
                setInitialIntensity([5]);
                setFinalIntensity([5]);
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
          <span className="text-xs text-muted-foreground">Reframing CBT</span>
        </div>
        <Progress value={((step + 1) / 7) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-medium">{currentStep.question}</h3>

        {"isEmotionStep" in currentStep && currentStep.isEmotionStep ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Emocion</Label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una emocion" />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map((e) => (
                    <SelectItem key={e} value={e} className="capitalize">
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intensidad: {initialIntensity[0]}/10</Label>
              <Slider
                value={initialIntensity}
                onValueChange={setInitialIntensity}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>
        ) : "isReevalStep" in currentStep && currentStep.isReevalStep ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva intensidad: {finalIntensity[0]}/10</Label>
              <Slider
                value={finalIntensity}
                onValueChange={setFinalIntensity}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mucho menor</span>
                <span>Igual o mayor</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Intensidad inicial: {initialIntensity[0]}/10
            </p>
          </div>
        ) : (
          <Textarea
            placeholder={currentStep.placeholder}
            value={answers[step]}
            onChange={(e) => updateAnswer(e.target.value)}
            rows={4}
          />
        )}

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
            disabled={!canProceed() || isSaving}
          >
            {step < 6
              ? "Siguiente"
              : isSaving
                ? "Guardando..."
                : "Finalizar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
