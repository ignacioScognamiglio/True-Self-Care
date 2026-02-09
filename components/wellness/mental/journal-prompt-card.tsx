"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const PROMPTS_BY_MOOD: Record<string, string[]> = {
  feliz: [
    "Que fue lo mejor que te paso hoy? Describilo con detalle.",
    "Que fortaleza tuya contribuyo a este buen momento?",
    "Como podrias compartir esta energia positiva con alguien mas?",
  ],
  calmado: [
    "Que te ayudo a llegar a este estado de calma?",
    "Describii un momento de hoy en el que te sentiste en paz.",
    "Que habitos o rutinas contribuyen a tu tranquilidad?",
  ],
  neutral: [
    "Que te gustaria que fuera diferente en tu dia?",
    "Hay algo que estuviste evitando pensar? Exploralo con curiosidad.",
    "Que pequeno cambio podrias hacer manana para sentirte mejor?",
  ],
  triste: [
    "Que especificamente te entristece? Nombrar la emocion es el primer paso.",
    "Si pudieras hablar con tu yo del futuro, que te diria?",
    "Que cosas, por pequenas que sean, te reconfortan cuando te sentis asi?",
  ],
  ansioso: [
    "Que especificamente te preocupa ahora? Separa hechos de suposiciones.",
    "Que es lo peor que podria pasar, y que tan probable es realmente?",
    "Que cosas estan bajo tu control en esta situacion?",
  ],
  enojado: [
    "Que necesidad no satisfecha hay detras de este enojo?",
    "Si pudieras expresar lo que sentis sin filtro, que dirias?",
    "Que limite necesitas poner para proteger tu bienestar?",
  ],
  estresado: [
    "Cuales son las 3 cosas que mas te estan estresando ahora mismo?",
    "Que podrias soltar o delegar para aliviar la carga?",
    "Cuando fue la ultima vez que hiciste algo solo por placer?",
  ],
  agotado: [
    "Que te esta drenando mas energia ultimamente?",
    "Que necesitas para recargar? Permitite pedirlo.",
    "Que cosas podrias simplificar o dejar de hacer por un tiempo?",
  ],
};

const DEFAULT_PROMPTS = [
  "Que tres cosas agradeces hoy?",
  "Que aprendiste sobre vos hoy?",
  "Como te gustaria sentirte manana?",
];

interface JournalPromptCardProps {
  onSelectPrompt: (prompt: string) => void;
}

export function JournalPromptCard({ onSelectPrompt }: JournalPromptCardProps) {
  const moodSummary = useQuery(api.functions.mental.getTodayMoodSummaryPublic);

  const currentMood = moodSummary?.latestMood ?? null;
  const prompts = currentMood
    ? PROMPTS_BY_MOOD[currentMood] ?? DEFAULT_PROMPTS
    : DEFAULT_PROMPTS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="size-4 text-amber-500" />
          Inspiracion para escribir
          {currentMood && (
            <span className="text-xs text-muted-foreground">
              (basado en tu mood: {currentMood})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {prompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted"
            >
              {prompt}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
