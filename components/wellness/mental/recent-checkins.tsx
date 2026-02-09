"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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

export function RecentCheckins() {
  const checkins = useQuery(api.functions.mental.getRecentMoodCheckins);

  if (!checkins) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (checkins.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No hay check-ins de hoy
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {checkins.map((checkin) => {
        const data = checkin.data as any;
        const emoji = MOOD_EMOJIS[data.mood] ?? "\u{1F610}";
        const timeAgo = formatDistanceToNow(new Date(checkin.timestamp), {
          addSuffix: true,
          locale: es,
        });

        return (
          <div
            key={checkin._id}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <span className="text-2xl">{emoji}</span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{data.mood}</span>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Intensidad: {data.intensity}/10
              </div>
              {data.emotions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.emotions.map((e: string) => (
                    <Badge key={e} variant="secondary" className="text-xs capitalize">
                      {e}
                    </Badge>
                  ))}
                </div>
              )}
              {data.notes && (
                <p className="text-sm text-muted-foreground">{data.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
