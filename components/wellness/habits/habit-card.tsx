"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Flame, MoreVertical, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  Salud: "bg-wellness-nutrition/15 text-wellness-nutrition border-wellness-nutrition/30",
  Fitness: "bg-wellness-fitness/15 text-wellness-fitness border-wellness-fitness/30",
  Mental: "bg-wellness-mental/15 text-wellness-mental border-wellness-mental/30",
  "Cuidado personal": "bg-wellness-hydration/15 text-wellness-hydration border-wellness-hydration/30",
  General: "bg-muted text-muted-foreground border-border",
};

interface HabitCardProps {
  habit: {
    _id: Id<"habits">;
    name: string;
    category: string;
    currentStreak: number;
    frequency: string;
    targetPerPeriod: number;
  };
  isCompletedToday: boolean;
}

export function HabitCard({ habit, isCompletedToday }: HabitCardProps) {
  const completeHabit = useMutation(api.functions.habits.completeHabitPublic);
  const deleteHabit = useMutation(api.functions.habits.deleteHabit);

  async function handleComplete() {
    await completeHabit({ habitId: habit._id });
    toast.success("Habito completado");
  }

  async function handleDelete() {
    await deleteHabit({ habitId: habit._id });
    toast.success("Habito eliminado");
  }

  const colorClass = CATEGORY_COLORS[habit.category] ?? CATEGORY_COLORS.General;

  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant={isCompletedToday ? "default" : "outline"}
          size="icon"
          className={`size-8 shrink-0 ${isCompletedToday ? "bg-green-600 hover:bg-green-600" : ""}`}
          disabled={isCompletedToday}
          onClick={handleComplete}
        >
          <Check className="size-4" />
        </Button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{habit.name}</span>
            <Badge variant="outline" className={colorClass}>
              {habit.category}
            </Badge>
          </div>

          {habit.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Flame className="size-3 text-orange-500" />
              <span>
                {habit.currentStreak} {habit.currentStreak === 1 ? "dia" : "dias"}
              </span>
              {habit.currentStreak >= 30 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-yellow-100 text-yellow-700 border-yellow-300">x3</Badge>
              )}
              {habit.currentStreak >= 14 && habit.currentStreak < 30 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-100 text-green-700 border-green-300">x2</Badge>
              )}
              {habit.currentStreak >= 7 && habit.currentStreak < 14 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-100 text-blue-700 border-blue-300">x1.5</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="size-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
