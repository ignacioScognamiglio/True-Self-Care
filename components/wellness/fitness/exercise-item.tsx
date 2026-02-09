"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: "strength" | "cardio" | "flexibility" | "sport";
  sets: ExerciseSet[];
  duration?: number;
  distance?: number;
  notes?: string;
}

interface ExerciseItemProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onRemove: () => void;
  onSetCompleted: () => void;
}

export function ExerciseItem({
  exercise,
  onUpdate,
  onRemove,
  onSetCompleted,
}: ExerciseItemProps) {
  function updateSet(setIndex: number, field: keyof ExerciseSet, value: number | boolean) {
    const newSets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, [field]: value } : s
    );
    const wasCompleted = !exercise.sets[setIndex].completed && field === "completed" && value === true;
    onUpdate({ ...exercise, sets: newSets });
    if (wasCompleted) {
      onSetCompleted();
    }
  }

  function addSet() {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = lastSet
      ? { reps: lastSet.reps, weight: lastSet.weight, completed: false }
      : { reps: 10, weight: 0, completed: false };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  }

  function removeSet(index: number) {
    if (exercise.sets.length <= 1) return;
    onUpdate({
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== index),
    });
  }

  const isCardio = exercise.type === "cardio";

  return (
    <div className="rounded-lg border p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Input
          value={exercise.name}
          onChange={(e) => onUpdate({ ...exercise, name: e.target.value })}
          className="h-8 font-medium border-0 px-0 focus-visible:ring-0 text-sm"
          placeholder="Nombre del ejercicio"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {isCardio ? (
        /* Cardio: duration + distance */
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">
              Duracion (min)
            </label>
            <Input
              type="number"
              value={exercise.duration ?? ""}
              onChange={(e) =>
                onUpdate({
                  ...exercise,
                  duration: Number(e.target.value) || 0,
                })
              }
              className="h-8 text-sm"
              min={0}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">
              Distancia (km)
            </label>
            <Input
              type="number"
              value={exercise.distance ?? ""}
              onChange={(e) =>
                onUpdate({
                  ...exercise,
                  distance: Number(e.target.value) || 0,
                })
              }
              className="h-8 text-sm"
              min={0}
              step={0.1}
            />
          </div>
        </div>
      ) : (
        /* Strength: sets table */
        <div className="space-y-1">
          {/* Header row */}
          <div className="grid grid-cols-[32px_1fr_auto_1fr_32px] items-center gap-1.5 text-[10px] text-muted-foreground uppercase px-0.5">
            <span className="text-center">Set</span>
            <span className="text-center">Reps</span>
            <span />
            <span className="text-center">Peso (kg)</span>
            <span />
          </div>

          {/* Set rows */}
          {exercise.sets.map((set, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[32px_1fr_auto_1fr_32px] items-center gap-1.5",
                set.completed && "opacity-50"
              )}
            >
              {/* Completion toggle */}
              <Button
                variant={set.completed ? "default" : "outline"}
                size="icon"
                className={cn(
                  "size-7",
                  set.completed && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => updateSet(i, "completed", !set.completed)}
              >
                {set.completed ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </Button>

              {/* Reps */}
              <Input
                type="number"
                value={set.reps}
                onChange={(e) =>
                  updateSet(i, "reps", Number(e.target.value) || 0)
                }
                className={cn("h-8 text-sm text-center", set.completed && "line-through")}
                min={0}
                disabled={set.completed}
              />

              <span className="text-xs text-muted-foreground">x</span>

              {/* Weight */}
              <Input
                type="number"
                value={set.weight}
                onChange={(e) =>
                  updateSet(i, "weight", Number(e.target.value) || 0)
                }
                className={cn("h-8 text-sm text-center", set.completed && "line-through")}
                min={0}
                step={0.5}
                disabled={set.completed}
              />

              {/* Remove set */}
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
                onClick={() => removeSet(i)}
                disabled={exercise.sets.length <= 1}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}

          {/* Add set */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={addSet}
          >
            <Plus className="size-3 mr-1" />
            Agregar serie
          </Button>
        </div>
      )}
    </div>
  );
}
