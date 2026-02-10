"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface XPBarProps {
  compact?: boolean;
}

export function XPBar({ compact }: XPBarProps) {
  const profile = useQuery(api.functions.gamification.getGamificationProfile);

  if (!profile) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Zap className="size-4 text-yellow-500" />
            <span className="font-semibold">Nivel {profile.level}</span>
          </div>
          <span className="text-muted-foreground">
            {profile.currentLevelXP}/{profile.xpToNextLevel} XP
          </span>
        </div>
        <Progress value={profile.progressPercent} className="h-2" />
        {profile.currentMultiplier.multiplier > 1.0 && (
          <Badge variant="secondary" className="text-xs">
            {profile.currentMultiplier.label}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-yellow-500" />
          <span className="text-lg font-bold">Nivel {profile.level}</span>
        </div>
        {profile.currentMultiplier.multiplier > 1.0 && (
          <Badge variant="secondary">
            {profile.currentMultiplier.label}
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <Progress value={profile.progressPercent} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{profile.currentLevelXP} XP</span>
          <span>{profile.xpToNextLevel} XP para nivel {profile.level + 1}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        XP Total: {profile.totalXP.toLocaleString()}
      </p>
    </div>
  );
}
