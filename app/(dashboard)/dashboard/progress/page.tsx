"use client";

import { useState } from "react";
import { GoalsManagement } from "@/components/progress/goals-management";
import { PhotoTimeline } from "@/components/progress/photo-timeline";
import { WellnessScoreCard } from "@/components/progress/wellness-score-card";
import { WeightOverTimeChart } from "@/components/progress/weight-over-time-chart";
import { StreakHistoryChart } from "@/components/progress/streak-history-chart";
import { ModuleTrendCards } from "@/components/progress/module-trend-cards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TIME_RANGES = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
] as const;

export default function ProgressPage() {
  const [days, setDays] = useState(30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progreso</h2>
          <p className="text-muted-foreground">
            Seguimiento de tus metas y progreso general
          </p>
        </div>
        <Tabs
          value={String(days)}
          onValueChange={(v) => setDays(Number(v))}
        >
          <TabsList>
            {TIME_RANGES.map((r) => (
              <TabsTrigger key={r.value} value={String(r.value)}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <WellnessScoreCard days={days} />
        <WeightOverTimeChart days={days} />
      </div>

      <StreakHistoryChart />
      <ModuleTrendCards days={days} />

      {/* Goals */}
      <GoalsManagement />

      {/* Photos */}
      <PhotoTimeline />
    </div>
  );
}
