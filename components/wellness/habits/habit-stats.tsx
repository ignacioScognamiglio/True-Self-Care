"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Flame, TrendingUp } from "lucide-react";

export function HabitStats() {
  const summary = useQuery(api.functions.habits.getTodayCompletionsSummary);

  if (!summary) {
    return null;
  }

  const rate =
    summary.total > 0
      ? Math.round((summary.completedToday / summary.total) * 100)
      : 0;

  const stats = [
    {
      label: "Habitos activos",
      value: summary.total,
      icon: Target,
      color: "text-wellness-fitness",
    },
    {
      label: "Completados hoy",
      value: summary.completedToday,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Mejor racha",
      value: `${summary.bestCurrentStreak} dias`,
      icon: Flame,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Tasa de hoy</span>
            <TrendingUp className="size-4 text-wellness-mental" />
          </div>
          <div className="text-2xl font-bold mb-2">{rate}%</div>
          <Progress
            value={rate}
            className="h-2 [&>div]:bg-wellness-mental"
          />
        </CardContent>
      </Card>
    </div>
  );
}
