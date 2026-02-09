"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseItem, type Exercise } from "./exercise-item";
import { WorkoutTimer } from "./workout-timer";
import { Plus, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ActiveWorkout() {
  const router = useRouter();
  const logExercise = useMutation(api.functions.fitness.logExerciseEntryPublic);

  const [startedAt] = useState(Date.now());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [isSaving, setIsSaving] = useState(false);

  // New exercise form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Exercise["type"]>("strength");

  function addExercise() {
    if (!newName.trim()) return;
    const exercise: Exercise = {
      id: generateId(),
      name: newName.trim(),
      type: newType,
      sets:
        newType === "cardio"
          ? []
          : [{ reps: 10, weight: 0, completed: false }],
    };
    setExercises((prev) => [...prev, exercise]);
    setNewName("");
  }

  function updateExercise(id: string, updated: Exercise) {
    setExercises((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  function handleSetCompleted() {
    setIsResting(true);
  }

  const handleRestComplete = useCallback(() => {
    setIsResting(false);
  }, []);

  async function handleFinishWorkout() {
    if (exercises.length === 0) {
      toast.error("Agrega al menos un ejercicio");
      return;
    }

    setIsSaving(true);
    const durationMinutes = Math.round((Date.now() - startedAt) / 60000);

    try {
      for (const exercise of exercises) {
        const completedSets = exercise.sets.filter((s) => s.completed);

        if (exercise.type === "cardio") {
          await logExercise({
            exercise: {
              name: exercise.name,
              type: exercise.type,
              duration: exercise.duration ?? 0,
              distance: exercise.distance,
            },
          });
        } else if (completedSets.length > 0) {
          // For strength: aggregate completed sets
          const totalReps = completedSets.reduce((sum, s) => sum + s.reps, 0);
          const maxWeight = Math.max(...completedSets.map((s) => s.weight));

          await logExercise({
            exercise: {
              name: exercise.name,
              type: exercise.type,
              sets: completedSets.length,
              reps: Math.round(totalReps / completedSets.length),
              weight: maxWeight,
              duration: durationMinutes,
            },
          });
        }
      }

      toast.success("Workout finalizado");
      router.push("/dashboard/fitness");
    } catch {
      toast.error("Error al guardar el workout");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (
      exercises.length > 0 &&
      !window.confirm("Perder datos del workout actual?")
    ) {
      return;
    }
    router.push("/dashboard/fitness");
  }

  const totalCompletedSets = exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Session timer */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <WorkoutTimer mode="session" isRunning={true} />
          <div className="text-right text-sm text-muted-foreground">
            <div>{exercises.length} ejercicios</div>
            <div>{totalCompletedSets} series completadas</div>
          </div>
        </CardContent>
      </Card>

      {/* Rest timer */}
      {isResting && (
        <Card className="border-primary/50">
          <CardContent className="py-4">
            <WorkoutTimer
              mode="rest"
              initialSeconds={restDuration}
              isRunning={true}
              onRestComplete={handleRestComplete}
              onSelectRestTime={setRestDuration}
            />
          </CardContent>
        </Card>
      )}

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            onUpdate={(updated) => updateExercise(exercise.id, updated)}
            onRemove={() => removeExercise(exercise.id)}
            onSetCompleted={handleSetCompleted}
          />
        ))}
      </div>

      {/* Add exercise form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Agregar ejercicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Nombre del ejercicio"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExercise()}
          />
          <div className="flex gap-2">
            <Select
              value={newType}
              onValueChange={(v) => setNewType(v as Exercise["type"])}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Fuerza</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibilidad</SelectItem>
                <SelectItem value="sport">Deporte</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addExercise} disabled={!newName.trim()}>
              <Plus className="size-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="size-4 mr-1" />
          Cancelar
        </Button>
        <Button
          className="flex-1"
          onClick={handleFinishWorkout}
          disabled={isSaving || exercises.length === 0}
        >
          <CheckCircle className="size-4 mr-1" />
          {isSaving ? "Guardando..." : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}
