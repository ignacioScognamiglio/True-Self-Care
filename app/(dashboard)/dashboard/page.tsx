"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, UtensilsCrossed, Dumbbell, Target, Brain, Moon } from "lucide-react";
import { InsightsFeed } from "@/components/wellness/insights/insights-feed";
import { DailyPlan } from "@/components/wellness/daily-plan";
import { XPBar } from "@/components/wellness/gamification/xp-bar";
import { ChallengeCard } from "@/components/wellness/gamification/challenge-card";


function formatMl(ml: number) {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
}

export default function DashboardPage() {
  const waterIntake = useQuery(api.functions.wellness.getTodayWaterIntakePublic);
  const habitSummary = useQuery(api.functions.habits.getTodayCompletionsSummary);
  const nutritionSummary = useQuery(api.functions.nutrition.getTodayNutritionSummaryPublic);
  const exerciseSummary = useQuery(api.functions.fitness.getTodayExerciseSummaryPublic);
  const moodSummary = useQuery(api.functions.mental.getTodayMoodSummaryPublic);
  const sleepSummary = useQuery(api.functions.sleep.getTodaySleepSummaryPublic);

  const hydrationValue = waterIntake
    ? `${formatMl(waterIntake.totalMl)} / 2.5L`
    : "\u2014";
  const hydrationSub = waterIntake
    ? `${Math.min(100, Math.round((waterIntake.totalMl / 2500) * 100))}% de tu meta`
    : "Empieza a registrar";

  const nutritionValue = nutritionSummary
    ? `${nutritionSummary.totalCalories} kcal`
    : "\u2014";
  const nutritionSub = nutritionSummary
    ? `${nutritionSummary.mealCount} comida${nutritionSummary.mealCount !== 1 ? "s" : ""} | P:${nutritionSummary.totalProtein}g`
    : "Empieza a registrar";

  const fitnessValue = exerciseSummary
    ? `${exerciseSummary.exerciseCount} ejercicio${exerciseSummary.exerciseCount !== 1 ? "s" : ""}`
    : "\u2014";
  const fitnessSub = exerciseSummary
    ? exerciseSummary.totalCaloriesBurned > 0
      ? `${exerciseSummary.totalCaloriesBurned} kcal quemadas`
      : "Entrena hoy para ver datos"
    : "Empieza a registrar";

  const habitsValue = habitSummary
    ? `${habitSummary.completedToday}/${habitSummary.total}`
    : "\u2014";
  const habitsSub = habitSummary
    ? habitSummary.bestCurrentStreak > 0
      ? `Mejor racha: ${habitSummary.bestCurrentStreak} dias`
      : "Completa habitos para iniciar racha"
    : "Empieza a registrar";

  const moodEmojis: Record<string, string> = {
    feliz: "\u{1F60A}",
    calmado: "\u{1F60C}",
    neutral: "\u{1F610}",
    triste: "\u{1F622}",
    ansioso: "\u{1F630}",
    enojado: "\u{1F621}",
    estresado: "\u{1F624}",
    agotado: "\u{1F634}",
  };

  const moodValue = moodSummary?.hasCheckedIn
    ? `${moodEmojis[moodSummary.latestMood!] ?? ""} ${moodSummary.latestMood}`
    : "\u2014";
  const moodSub = moodSummary?.hasCheckedIn
    ? `Intensidad ${moodSummary.latestIntensity}/10`
    : "Hace tu check-in";

  const sleepValue = sleepSummary?.hasLoggedSleep
    ? `${sleepSummary.durationFormatted}`
    : "\u2014";
  const sleepSub = sleepSummary?.hasLoggedSleep
    ? `Score: ${sleepSummary.qualityScore}/100`
    : "Registra tu sueno";

  const quickStats = [
    {
      title: "Hidratacion",
      value: hydrationValue,
      sub: hydrationSub,
      icon: Droplets,
      color: "text-wellness-hydration",
    },
    {
      title: "Nutricion",
      value: nutritionValue,
      sub: nutritionSub,
      icon: UtensilsCrossed,
      color: "text-orange-500",
    },
    {
      title: "Fitness",
      value: fitnessValue,
      sub: fitnessSub,
      icon: Dumbbell,
      color: "text-wellness-fitness",
    },
    {
      title: "Habitos",
      value: habitsValue,
      sub: habitsSub,
      icon: Target,
      color: "text-purple-500",
    },
    {
      title: "Animo",
      value: moodValue,
      sub: moodSub,
      icon: Brain,
      color: "text-wellness-mental",
    },
    {
      title: "Sueno",
      value: sleepValue,
      sub: sleepSub,
      icon: Moon,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Hub</h2>
        <p className="text-muted-foreground">
          Tu resumen de bienestar personalizado
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
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

      {/* Gamificacion widgets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tu Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <XPBar compact />
          </CardContent>
        </Card>
        <ChallengeCard compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DailyPlan />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Insights</h3>
          <InsightsFeed limit={3} compact />
        </div>
      </div>
    </div>
  );
}
