"use client";

import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
}

function getLevelColor(level: number) {
  if (level <= 5) return "bg-gray-200 text-gray-700 border-gray-300";
  if (level <= 10) return "bg-green-100 text-green-700 border-green-300";
  if (level <= 20) return "bg-blue-100 text-blue-700 border-blue-300";
  if (level <= 30) return "bg-purple-100 text-purple-700 border-purple-300";
  if (level <= 40) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
};

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 flex items-center justify-center font-bold",
        getLevelColor(level),
        sizeClasses[size]
      )}
    >
      {level}
    </div>
  );
}
