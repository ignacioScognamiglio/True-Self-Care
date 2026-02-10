"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  estimatedDuration?: number;
  exercises: PlanExercise[];
}

interface WorkoutPlanContent {
  title: string;
  objective?: string;
  daysPerWeek?: number;
  days: WorkoutDay[];
}

interface WorkoutPlanEditorProps {
  planId: Id<"aiPlans">;
  initialContent: WorkoutPlanContent;
  onClose: () => void;
}

export function WorkoutPlanEditor({
  planId,
  initialContent,
  onClose,
}: WorkoutPlanEditorProps) {
  const updateContent = useMutation(api.functions.plans.updatePlanContent);
  const [content, setContent] = useState<WorkoutPlanContent>(() => {
    const parsed = JSON.parse(JSON.stringify(initialContent));
    return { ...parsed, days: parsed.days ?? [] };
  });
  const [isSaving, setIsSaving] = useState(false);

  function updateDay(dayIndex: number, updatedDay: WorkoutDay) {
    setContent((prev) => ({
      ...prev,
      days: prev.days.map((d, i) => (i === dayIndex ? updatedDay : d)),
    }));
  }

  function updateExercise(
    dayIndex: number,
    exIndex: number,
    updatedExercise: PlanExercise
  ) {
    const day = content.days[dayIndex];
    updateDay(dayIndex, {
      ...day,
      exercises: day.exercises.map((e, i) =>
        i === exIndex ? updatedExercise : e
      ),
    });
  }

  function addExercise(dayIndex: number) {
    const day = content.days[dayIndex];
    updateDay(dayIndex, {
      ...day,
      exercises: [
        ...day.exercises,
        { name: "", sets: 3, reps: "10", rest: 90 },
      ],
    });
  }

  function removeExercise(dayIndex: number, exIndex: number) {
    const day = content.days[dayIndex];
    updateDay(dayIndex, {
      ...day,
      exercises: day.exercises.filter((_, i) => i !== exIndex),
    });
  }

  function moveExercise(dayIndex: number, exIndex: number, direction: -1 | 1) {
    const day = content.days[dayIndex];
    const newIndex = exIndex + direction;
    if (newIndex < 0 || newIndex >= day.exercises.length) return;
    const exercises = [...day.exercises];
    [exercises[exIndex], exercises[newIndex]] = [
      exercises[newIndex],
      exercises[exIndex],
    ];
    updateDay(dayIndex, { ...day, exercises });
  }

  function addDay() {
    setContent((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          day: `Dia ${prev.days.length + 1}`,
          focus: "",
          exercises: [],
        },
      ],
    }));
  }

  function removeDay(dayIndex: number) {
    setContent((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== dayIndex),
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateContent({ planId, content });
      toast.success("Plan actualizado");
      onClose();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Title and objective */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Input
            value={content.title}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Titulo del plan"
            className="font-medium"
          />
          <Textarea
            value={content.objective ?? ""}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, objective: e.target.value }))
            }
            placeholder="Objetivo del plan"
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Days */}
      {content.days.map((day, dayIndex) => (
        <Card key={dayIndex}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Input
                value={day.day}
                onChange={(e) =>
                  updateDay(dayIndex, { ...day, day: e.target.value })
                }
                className="h-8 font-medium border-0 px-0 focus-visible:ring-0 text-sm flex-1"
                placeholder="Nombre del dia"
              />
              <Input
                value={day.focus}
                onChange={(e) =>
                  updateDay(dayIndex, { ...day, focus: e.target.value })
                }
                className="h-8 text-sm w-32"
                placeholder="Foco"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeDay(dayIndex)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {day.exercises.map((exercise, exIndex) => (
              <div
                key={exIndex}
                className="rounded-md border p-2.5 space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <Input
                    value={exercise.name}
                    onChange={(e) =>
                      updateExercise(dayIndex, exIndex, {
                        ...exercise,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ejercicio"
                    className="h-7 text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => moveExercise(dayIndex, exIndex, -1)}
                    disabled={exIndex === 0}
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => moveExercise(dayIndex, exIndex, 1)}
                    disabled={exIndex === day.exercises.length - 1}
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => removeExercise(dayIndex, exIndex)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Series
                    </label>
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, {
                          ...exercise,
                          sets: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs text-center"
                      min={0}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Reps
                    </label>
                    <Input
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, {
                          ...exercise,
                          reps: e.target.value,
                        })
                      }
                      className="h-7 text-xs text-center"
                      placeholder="8-12"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Desc(s)
                    </label>
                    <Input
                      type="number"
                      value={exercise.rest}
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, {
                          ...exercise,
                          rest: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs text-center"
                      min={0}
                      step={15}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => addExercise(dayIndex)}
            >
              <Plus className="size-3 mr-1" />
              Agregar ejercicio
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Add day */}
      <Button variant="outline" size="sm" className="w-full" onClick={addDay}>
        <Plus className="size-3.5 mr-1" />
        Agregar dia
      </Button>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isSaving}
        >
          <X className="size-4 mr-1" />
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
          <Save className="size-4 mr-1" />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
