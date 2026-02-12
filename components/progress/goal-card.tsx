"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pause,
  Play,
  CheckCircle,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface GoalCardProps {
  goal: Doc<"goals">;
}

const CATEGORY_COLORS: Record<string, string> = {
  fitness: "bg-red-500/10 text-red-700",
  nutrition: "bg-orange-500/10 text-orange-700",
  sleep: "bg-indigo-500/10 text-indigo-700",
  mental: "bg-purple-500/10 text-purple-700",
  habits: "bg-green-500/10 text-green-700",
  weight: "bg-blue-500/10 text-blue-700",
  general: "bg-gray-500/10 text-gray-700",
};

export function GoalCard({ goal }: GoalCardProps) {
  const updateProgress = useMutation(api.functions.goals.updateGoalProgress);
  const pauseGoal = useMutation(api.functions.goals.pauseGoal);
  const resumeGoal = useMutation(api.functions.goals.resumeGoal);
  const completeGoal = useMutation(api.functions.goals.completeGoal);
  const deleteGoal = useMutation(api.functions.goals.deleteGoal);

  const current = goal.currentValue ?? 0;
  const target = goal.targetValue ?? 0;
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const handleIncrement = async () => {
    await updateProgress({
      goalId: goal._id,
      currentValue: current + 1,
    });
  };

  const handleDecrement = async () => {
    if (current <= 0) return;
    await updateProgress({
      goalId: goal._id,
      currentValue: current - 1,
    });
  };

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case "pause":
          await pauseGoal({ goalId: goal._id });
          toast.success("Meta pausada");
          break;
        case "resume":
          await resumeGoal({ goalId: goal._id });
          toast.success("Meta reanudada");
          break;
        case "complete":
          await completeGoal({ goalId: goal._id });
          toast.success("Meta completada!");
          break;
        case "delete":
          await deleteGoal({ goalId: goal._id });
          toast.success("Meta eliminada");
          break;
      }
    } catch {
      toast.error("Error al actualizar la meta");
    }
  };

  const colorClass =
    CATEGORY_COLORS[goal.category] ?? CATEGORY_COLORS.general;

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={colorClass}>
                {goal.category}
              </Badge>
              {goal.status === "paused" && (
                <Badge variant="outline">Pausada</Badge>
              )}
              {goal.status === "completed" && (
                <Badge className="bg-green-500/10 text-green-700">
                  Completada
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-sm truncate">{goal.title}</h4>
          </div>
          {goal.status !== "completed" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {goal.status === "active" && (
                  <DropdownMenuItem onClick={() => handleAction("pause")}>
                    <Pause className="size-4 mr-2" />
                    Pausar
                  </DropdownMenuItem>
                )}
                {goal.status === "paused" && (
                  <DropdownMenuItem onClick={() => handleAction("resume")}>
                    <Play className="size-4 mr-2" />
                    Reanudar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleAction("complete")}>
                  <CheckCircle className="size-4 mr-2" />
                  Completar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("delete")}
                  className="text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {target > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {current} / {target} {goal.unit ?? ""}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {goal.status === "active" && target > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={handleDecrement}
              disabled={current <= 0}
            >
              <Minus className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={handleIncrement}
            >
              <Plus className="size-3" />
            </Button>
          </div>
        )}

        {goal.deadline && (
          <p className="text-xs text-muted-foreground">
            Vence{" "}
            {formatDistanceToNow(new Date(goal.deadline), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
