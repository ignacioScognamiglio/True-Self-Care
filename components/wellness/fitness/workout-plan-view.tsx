"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Edit, Archive, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { WorkoutPlanEditor } from "./workout-plan-editor";
import Link from "next/link";

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

export function WorkoutPlanView() {
  const plan = useQuery(api.functions.plans.getActivePlanPublic, {
    type: "workout",
  });
  const updateStatus = useMutation(api.functions.plans.updatePlanStatus);
  const [isEditing, setIsEditing] = useState(false);

  if (plan === undefined) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  if (plan === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No tienes un plan de entrenamiento activo.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/chat">
              <Sparkles className="size-4 mr-1" />
              Pedir al asistente
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const content = plan.content as WorkoutPlanContent;

  if (isEditing) {
    return (
      <WorkoutPlanEditor
        planId={plan._id}
        initialContent={content}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  async function handleArchive() {
    if (!plan) return;
    await updateStatus({ planId: plan._id, status: "archived" });
    toast.success("Plan archivado");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {content.title || "Plan de entrenamiento"}
              </CardTitle>
              {content.objective && (
                <p className="text-sm text-muted-foreground">
                  {content.objective}
                </p>
              )}
              {content.daysPerWeek && (
                <p className="text-xs text-muted-foreground">
                  {content.daysPerWeek} dias/semana
                </p>
              )}
            </div>
            <Badge variant="default">Activo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="size-3.5 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="size-3.5 mr-1" />
              Archivar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Days */}
      {content.days?.map((day, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  {day.day}: {day.focus}
                </CardTitle>
                {day.estimatedDuration && (
                  <p className="text-xs text-muted-foreground">
                    ~{day.estimatedDuration} min
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/fitness/workout">
                  <Play className="size-3.5 mr-1" />
                  Iniciar
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {day.exercises.map((exercise, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between text-sm rounded-md border px-3 py-2"
                >
                  <span className="font-medium">{exercise.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {exercise.sets}x{exercise.reps}
                    </span>
                    <span>Desc: {exercise.rest}s</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
