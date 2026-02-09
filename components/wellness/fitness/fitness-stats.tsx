"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Flame, Clock, TrendingUp } from "lucide-react";

const STATS_CONFIG = [
  { label: "Ejercicios hoy", key: "exerciseCount", unit: "", icon: Dumbbell, color: "text-wellness-fitness" },
  { label: "Calorias quemadas", key: "totalCaloriesBurned", unit: "kcal", icon: Flame, color: "text-orange-500" },
  { label: "Tiempo total", key: "totalDuration", unit: "min", icon: Clock, color: "text-blue-500" },
  { label: "Volumen total", key: "totalVolume", unit: "kg", icon: TrendingUp, color: "text-green-500" },
] as const;

export function FitnessStats() {
  const summary = useQuery(
    api.functions.fitness.getTodayExerciseSummaryPublic
  );

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {STATS_CONFIG.map((stat) => {
        const value = summary?.[stat.key] ?? 0;
        const Icon = stat.icon;

        return (
          <Card key={stat.key}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
                <Icon className={`size-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">
                {value}
                {stat.unit && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {stat.unit}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
