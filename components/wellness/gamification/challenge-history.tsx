"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completado",
  archived: "Descartado",
  active: "Activo",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  facil: "bg-green-100 text-green-700",
  medio: "bg-yellow-100 text-yellow-700",
  dificil: "bg-red-100 text-red-700",
};

export function ChallengeHistory() {
  const challenges = useQuery(api.functions.challenges.getChallenges, {
    limit: 10,
  });

  if (!challenges) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Trophy className="size-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Todavia no completaste ningun challenge</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {challenges.map((c) => (
        <div
          key={c._id}
          className="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{c.title}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${DIFFICULTY_STYLES[c.difficulty] ?? ""}`}>
                {c.difficulty}
              </Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_STYLES[c.status] ?? ""}`}>
                {STATUS_LABELS[c.status] ?? c.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(c.generatedAt).toLocaleDateString("es-AR")} -
              {c.status === "completed" ? ` ${c.currentValue}/${c.targetValue}` : ` ${c.currentValue}/${c.targetValue}`}
            </p>
          </div>
          {c.status === "completed" && (
            <span className="text-xs font-medium text-yellow-600 shrink-0 ml-2">
              +{c.xpReward} XP
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
