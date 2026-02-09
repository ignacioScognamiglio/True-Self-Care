"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HabitCard } from "./habit-card";
import { CreateHabitDialog } from "./create-habit-dialog";
import { Target } from "lucide-react";

export function HabitList() {
  const habits = useQuery(api.functions.habits.getUserHabitsPublic);
  const completedIds = useQuery(api.functions.habits.getTodayCompletedHabitIds);

  if (!habits || !completedIds) {
    return <div className="text-sm text-muted-foreground">Cargando...</div>;
  }

  const completedSet = new Set(completedIds);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="size-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground mb-4">Aun no tienes habitos</p>
        <CreateHabitDialog />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mis habitos</h3>
        <CreateHabitDialog />
      </div>

      <div className="space-y-2">
        {habits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            isCompletedToday={completedSet.has(habit._id)}
          />
        ))}
      </div>
    </div>
  );
}
