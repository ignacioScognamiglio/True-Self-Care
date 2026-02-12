"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon } from "lucide-react";
import { WearableBadge } from "@/components/wellness/google-fit/wearable-badge";

const FACTOR_LABELS: Record<string, string> = {
  estres: "Estres",
  cafeina: "Cafeina",
  alcohol: "Alcohol",
  pantallas: "Pantallas",
  ejercicio_tarde: "Ejercicio tarde",
  comida_pesada: "Comida pesada",
  ruido: "Ruido",
  temperatura: "Temperatura",
  dolor: "Dolor",
  medicacion: "Medicacion",
  meditacion: "Meditacion",
  lectura: "Lectura",
  musica_relajante: "Musica relajante",
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function SleepHistory() {
  const { results: history, status, loadMore } = usePaginatedQuery(
    api.functions.sleep.getSleepHistory,
    { days: 7 },
    { initialNumItems: 20 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="size-4 text-wellness-sleep" />
            Historial de sueno
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="size-4 text-wellness-sleep" />
          Historial de sueno
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
            No hay registros de sueno. Registra tu primera noche!
          </div>
        ) : (
          <div className="space-y-3">
            {history
              .filter((e) => e.bedTime !== null)
              .map((entry, i) => {
                const dateStr = new Date(entry.date).toLocaleDateString(
                  "es-AR",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }
                );

                const factors: string[] = entry.factors ?? [];

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{dateStr}</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.bedTime} → {entry.wakeTime}
                        </span>
                        {entry.source === "wearable" && <WearableBadge />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(entry.durationMinutes)}
                        </span>
                      </div>
                      {factors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {factors.map((f) => (
                            <Badge
                              key={f}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {FACTOR_LABELS[f] ?? f}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-full px-2.5 py-1 text-sm font-bold ${getScoreBg(entry.qualityScore)}`}
                    >
                      {entry.qualityScore}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
