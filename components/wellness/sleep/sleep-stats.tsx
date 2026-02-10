"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, TrendingUp, Moon } from "lucide-react";

export function SleepStats() {
  const today = useQuery(api.functions.sleep.getTodaySleepSummaryPublic);
  const weeklyStats = useQuery(api.functions.sleep.getSleepStats, { days: 7 });

  if (!today && !weeklyStats) {
    return null;
  }

  const todayScore =
    today?.hasLoggedSleep && today.qualityScore != null
      ? today.qualityScore
      : null;

  const todayDuration =
    today?.hasLoggedSleep && today.durationFormatted != null
      ? today.durationFormatted
      : null;

  const weeklyAvg =
    weeklyStats && weeklyStats.totalNightsLogged > 0
      ? weeklyStats.averageQualityScore
      : null;

  const consistency =
    weeklyStats && weeklyStats.totalNightsLogged > 0
      ? weeklyStats.consistencyScore
      : null;

  const stats = [
    {
      label: "Calidad hoy",
      value: todayScore != null ? todayScore : "--",
      icon: Star,
      color: "text-indigo-500",
    },
    {
      label: "Duracion",
      value: todayDuration ?? "--",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Promedio semanal",
      value: weeklyAvg != null ? weeklyAvg : "--",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Consistencia",
      value: consistency != null ? `${consistency}%` : "--",
      icon: Moon,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
