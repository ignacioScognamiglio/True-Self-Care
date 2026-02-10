"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flame, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MULTIPLIER_COLORS: Record<number, string> = {
  1.5: "bg-blue-100 text-blue-700",
  2.0: "bg-green-100 text-green-700",
  3.0: "bg-yellow-100 text-yellow-700",
};

export function StreakDisplay() {
  const profile = useQuery(api.functions.gamification.getGamificationProfile);

  if (!profile) {
    return (
      <div className="h-6 bg-muted animate-pulse rounded w-32" />
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Flame className="size-4 text-orange-500" />
        <span className="text-sm font-medium">
          Racha: {profile.bestStreak} {profile.bestStreak === 1 ? "dia" : "dias"}
        </span>
      </div>

      {profile.currentMultiplier.multiplier > 1.0 && (
        <Badge
          variant="outline"
          className={MULTIPLIER_COLORS[profile.currentMultiplier.multiplier] ?? ""}
        >
          {profile.currentMultiplier.label}
        </Badge>
      )}

      {profile.streakFreezes > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Shield className="size-3.5 text-blue-500" />
          <span>{profile.streakFreezes} freeze disponible</span>
        </div>
      )}
    </div>
  );
}
