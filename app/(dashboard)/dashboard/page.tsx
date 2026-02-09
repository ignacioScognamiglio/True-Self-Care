"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Moon, SmilePlus, Target } from "lucide-react";


function formatMl(ml: number) {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
}

export default function DashboardPage() {
  const waterIntake = useQuery(api.functions.wellness.getTodayWaterIntakePublic);
  const habitSummary = useQuery(api.functions.habits.getTodayCompletionsSummary);

  const hydrationValue = waterIntake
    ? `${formatMl(waterIntake.totalMl)} / 2.5L`
    : "\u2014";
  const hydrationSub = waterIntake
    ? `${Math.min(100, Math.round((waterIntake.totalMl / 2500) * 100))}% de tu meta`
    : "Start tracking to see data";

  const habitsValue = habitSummary
    ? `${habitSummary.completedToday}/${habitSummary.total}`
    : "\u2014";
  const habitsSub = habitSummary
    ? habitSummary.bestCurrentStreak > 0
      ? `Mejor racha: ${habitSummary.bestCurrentStreak} dias`
      : "Completa habitos para iniciar racha"
    : "Start tracking to see data";

  const quickStats = [
    {
      title: "Hydration",
      value: hydrationValue,
      sub: hydrationSub,
      icon: Droplets,
      color: "text-wellness-hydration",
    },
    {
      title: "Sleep",
      value: "\u2014",
      sub: "Start tracking to see data",
      icon: Moon,
      color: "text-wellness-sleep",
    },
    {
      title: "Mood",
      value: "\u2014",
      sub: "Start tracking to see data",
      icon: SmilePlus,
      color: "text-wellness-mental",
    },
    {
      title: "Habits",
      value: habitsValue,
      sub: habitsSub,
      icon: Target,
      color: "text-wellness-fitness",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Hub</h2>
        <p className="text-muted-foreground">
          Your personalized wellness overview
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
