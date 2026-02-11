"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const MODULE_LABELS: Record<string, string> = {
  sleep: "Sueno",
  nutrition: "Nutricion",
  exercise: "Ejercicio",
  mood: "Animo",
  water: "Agua",
  habit: "Habitos",
};

const MODULE_COLORS: Record<string, string> = {
  sleep: "text-indigo-500",
  nutrition: "text-orange-500",
  exercise: "text-red-500",
  mood: "text-purple-500",
  water: "text-blue-500",
  habit: "text-green-500",
};

interface ModuleTrendCardsProps {
  days: number;
}

export function ModuleTrendCards({ days }: ModuleTrendCardsProps) {
  const data = useQuery(api.functions.progress.getModuleTrends, { days });

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const activeModules = data.filter((m) => m.totalEntries > 0);
  if (activeModules.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {activeModules.map((mod) => {
        // Mini sparkline from last entries
        const maxCount = Math.max(...mod.days.map((d) => d.count), 1);

        return (
          <Card key={mod.module}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${MODULE_COLORS[mod.module] ?? ""}`}
                >
                  {MODULE_LABELS[mod.module] ?? mod.module}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mod.activeDays}d
                </span>
              </div>
              <p className="text-2xl font-bold">{mod.totalEntries}</p>
              <p className="text-xs text-muted-foreground">registros</p>

              {/* Mini sparkline */}
              {mod.days.length > 1 && (
                <div className="flex items-end gap-px h-6">
                  {mod.days.slice(-14).map((d, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${MODULE_COLORS[mod.module]?.replace("text-", "bg-") ?? "bg-gray-400"} opacity-70`}
                      style={{
                        height: `${Math.max((d.count / maxCount) * 100, 8)}%`,
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
