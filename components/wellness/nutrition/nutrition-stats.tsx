"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";

const STATS_CONFIG = [
  { label: "Calorias", key: "totalCalories", unit: "kcal", icon: Flame, color: "text-orange-500" },
  { label: "Proteina", key: "totalProtein", unit: "g", icon: Beef, color: "text-green-600" },
  { label: "Carbohidratos", key: "totalCarbs", unit: "g", icon: Wheat, color: "text-yellow-500" },
  { label: "Grasas", key: "totalFat", unit: "g", icon: Droplet, color: "text-orange-600" },
] as const;

export function NutritionStats() {
  const summary = useQuery(
    api.functions.nutrition.getTodayNutritionSummaryPublic
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
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {stat.unit}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
