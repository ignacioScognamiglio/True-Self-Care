"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, CheckCircle, Flame } from "lucide-react";

const MOOD_EMOJIS: Record<string, string> = {
  feliz: "\u{1F60A}",
  calmado: "\u{1F60C}",
  neutral: "\u{1F610}",
  triste: "\u{1F622}",
  ansioso: "\u{1F630}",
  enojado: "\u{1F621}",
  estresado: "\u{1F624}",
  agotado: "\u{1F634}",
};

export function MentalStats() {
  const summary = useQuery(api.functions.mental.getTodayMoodSummaryPublic);
  const { results: history } = usePaginatedQuery(
    api.functions.mental.getMoodHistory,
    { days: 30 },
    { initialNumItems: 200 }
  );

  // Calculate streak from history
  let streak = 0;
  if (history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].checkInCount > 0) {
        streak++;
      } else {
        break;
      }
    }
  }

  const moodEmoji = summary?.latestMood
    ? MOOD_EMOJIS[summary.latestMood] ?? "\u{1F610}"
    : null;

  const stats = [
    {
      title: "Animo de hoy",
      value: summary?.hasCheckedIn
        ? `${moodEmoji} ${summary.latestMood}`
        : "\u2014",
      icon: Brain,
      color: "text-wellness-mental",
    },
    {
      title: "Intensidad",
      value: summary?.hasCheckedIn
        ? `${summary.latestIntensity}/10`
        : "\u2014",
      icon: Activity,
      color: "text-wellness-mental",
    },
    {
      title: "Check-ins hoy",
      value: summary ? `${summary.checkInCount}` : "\u2014",
      icon: CheckCircle,
      color: "text-wellness-mental",
    },
    {
      title: "Racha",
      value: history.length > 0 ? `${streak} dia${streak !== 1 ? "s" : ""}` : "\u2014",
      icon: Flame,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`size-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
