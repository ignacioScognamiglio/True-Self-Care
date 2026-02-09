"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { Droplets } from "lucide-react";

const DAILY_GOAL_ML = 2500;

function formatMl(ml: number) {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
}

export function WaterTracker() {
  const waterIntake = useQuery(api.functions.wellness.getTodayWaterIntakePublic);

  const totalMl = waterIntake?.totalMl ?? 0;
  const percentage = Math.min(100, Math.round((totalMl / DAILY_GOAL_ML) * 100));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="size-5 text-wellness-hydration" />
          <span className="text-lg font-semibold">
            {formatMl(totalMl)} / {formatMl(DAILY_GOAL_ML)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        className="h-4 [&>div]:bg-wellness-hydration"
      />
    </div>
  );
}
