"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementCard } from "./achievement-card";

const CATEGORIES = [
  { value: "todos", label: "Todos" },
  { value: "principiante", label: "Principiante" },
  { value: "constancia", label: "Constancia" },
  { value: "dedicacion", label: "Dedicacion" },
  { value: "explorador", label: "Explorador" },
  { value: "maestria", label: "Maestria" },
];

export function AchievementsGrid() {
  const achievements = useQuery(
    api.functions.gamification.getAvailableAchievements
  );

  if (!achievements) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const earnedCount = achievements.filter((a) => a.earned).length;
  const sorted = [...achievements].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {earnedCount}/{achievements.length} logros desbloqueados
      </p>

      <Tabs defaultValue="todos">
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => {
          const filtered =
            cat.value === "todos"
              ? sorted
              : sorted.filter((a) => a.category === cat.value);

          return (
            <TabsContent key={cat.value} value={cat.value}>
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay logros en esta categoria
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((achievement) => (
                    <AchievementCard
                      key={achievement.code}
                      {...achievement}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
