"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";

const BREAKDOWN_LABELS: Record<string, string> = {
  habits: "Habitos",
  sleep: "Sueno",
  nutrition: "Nutricion",
  fitness: "Fitness",
  mood: "Animo",
};

const BREAKDOWN_COLORS: Record<string, string> = {
  habits: "bg-green-500",
  sleep: "bg-indigo-500",
  nutrition: "bg-orange-500",
  fitness: "bg-red-500",
  mood: "bg-purple-500",
};

interface WellnessScoreCardProps {
  days: number;
}

export function WellnessScoreCard({ days }: WellnessScoreCardProps) {
  const data = useQuery(api.functions.progress.getWellnessScore, { days });

  if (data === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-5" />
            Wellness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay suficientes datos para calcular tu score. Registra
            actividades para ver tu progreso.
          </p>
        </CardContent>
      </Card>
    );
  }

  const scoreColor =
    data.score >= 70
      ? "text-green-500"
      : data.score >= 40
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-5" />
          Wellness Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative flex size-28 items-center justify-center">
            <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${data.score * 2.64} 264`}
                strokeLinecap="round"
                className={scoreColor}
              />
            </svg>
            <span className={`absolute text-2xl font-bold ${scoreColor}`}>
              {data.score}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(data.breakdown).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full ${BREAKDOWN_COLORS[key] ?? "bg-gray-400"}`}
              />
              <span className="text-xs flex-1">
                {BREAKDOWN_LABELS[key] ?? key}
              </span>
              <div className="w-20 h-1.5 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${BREAKDOWN_COLORS[key] ?? "bg-gray-400"}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
