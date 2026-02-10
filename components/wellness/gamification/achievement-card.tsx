"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import {
  Droplets,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  Moon,
  Flame,
  CheckCircle,
  Calendar,
  Compass,
  Trophy,
  Star,
  Crown,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Droplets,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  Moon,
  Flame,
  CheckCircle,
  Calendar,
  Compass,
  Trophy,
  Star,
  Crown,
  Zap,
};

const CATEGORY_STYLES: Record<string, string> = {
  principiante: "bg-gray-100 text-gray-700 border-gray-200",
  constancia: "bg-blue-100 text-blue-700 border-blue-200",
  dedicacion: "bg-green-100 text-green-700 border-green-200",
  explorador: "bg-purple-100 text-purple-700 border-purple-200",
  maestria: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const CATEGORY_BORDER: Record<string, string> = {
  principiante: "border-gray-300",
  constancia: "border-blue-300",
  dedicacion: "border-green-300",
  explorador: "border-purple-300",
  maestria: "border-yellow-400",
};

interface AchievementCardProps {
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: number;
  target: number;
}

export function AchievementCard({
  name,
  description,
  category,
  icon,
  xpReward,
  earned,
  earnedAt,
  target,
}: AchievementCardProps) {
  const IconComponent = ICON_MAP[icon] ?? Star;
  const categoryStyle = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.principiante;
  const borderStyle = earned ? CATEGORY_BORDER[category] ?? "" : "border-muted";

  return (
    <Card className={earned ? `border-2 ${borderStyle}` : "opacity-60"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className={`size-10 rounded-full flex items-center justify-center ${
                earned ? categoryStyle : "bg-muted text-muted-foreground"
              }`}
            >
              <IconComponent className="size-5" />
            </div>
            {!earned && (
              <Lock className="size-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{name}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryStyle}`}>
                {category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-yellow-600">+{xpReward} XP</span>
              {earned && earnedAt && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(earnedAt).toLocaleDateString("es-AR")}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
