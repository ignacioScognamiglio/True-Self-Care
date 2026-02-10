"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MOODS = [
  { value: "feliz", emoji: "\u{1F60A}", label: "Feliz" },
  { value: "calmado", emoji: "\u{1F60C}", label: "Calmado" },
  { value: "neutral", emoji: "\u{1F610}", label: "Neutral" },
  { value: "triste", emoji: "\u{1F622}", label: "Triste" },
  { value: "ansioso", emoji: "\u{1F630}", label: "Ansioso" },
  { value: "enojado", emoji: "\u{1F621}", label: "Enojado" },
  { value: "estresado", emoji: "\u{1F624}", label: "Estresado" },
  { value: "agotado", emoji: "\u{1F634}", label: "Agotado" },
] as const;

const EMOTIONS = [
  "alegria",
  "gratitud",
  "esperanza",
  "amor",
  "ansiedad",
  "frustracion",
  "tristeza",
  "soledad",
  "confusion",
  "culpa",
  "envidia",
  "ira",
] as const;

const TRIGGERS = [
  "trabajo",
  "familia",
  "relaciones",
  "salud",
  "dinero",
  "estudios",
  "descanso",
  "ejercicio",
] as const;

interface MoodCheckinFormProps {
  onSuccess?: () => void;
}

export function MoodCheckinForm({ onSuccess }: MoodCheckinFormProps) {
  const router = useRouter();
  const logMood = useMutation(api.functions.mental.logMoodEntryPublic);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState([5]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleItem(arr: string[], item: string): string[] {
    return arr.includes(item)
      ? arr.filter((i) => i !== item)
      : [...arr, item];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Selecciona un estado de animo");
      return;
    }

    setIsSubmitting(true);
    try {
      await logMood({
        mood: {
          mood: selectedMood,
          intensity: intensity[0],
          notes: notes || undefined,
          triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
          emotions: selectedEmotions.length > 0 ? selectedEmotions : undefined,
        },
      });
      toast.success("Check-in registrado");
      setSelectedMood(null);
      setIntensity([5]);
      setSelectedEmotions([]);
      setSelectedTriggers([]);
      setNotes("");
      onSuccess?.();
      router.push("/dashboard/mental");
    } catch {
      toast.error("Error al registrar check-in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood Selection */}
      <div className="space-y-3">
        <Label>Como te sentis?</Label>
        <div className="grid grid-cols-4 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelectedMood(mood.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                selectedMood === mood.value
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="space-y-3">
        <Label>Intensidad: {intensity[0]}/10</Label>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Leve</span>
          <span>Intensa</span>
        </div>
      </div>

      {/* Emotions */}
      <div className="space-y-3">
        <Label>Emociones (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => (
            <Badge
              key={emotion}
              variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() =>
                setSelectedEmotions(toggleItem(selectedEmotions, emotion))
              }
            >
              {emotion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div className="space-y-3">
        <Label>Triggers (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((trigger) => (
            <Badge
              key={trigger}
              variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() =>
                setSelectedTriggers(toggleItem(selectedTriggers, trigger))
              }
            >
              {trigger}
            </Badge>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Algo mas que quieras agregar..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={!selectedMood || isSubmitting}>
        {isSubmitting ? "Registrando..." : "Registrar check-in"}
      </Button>
    </form>
  );
}
