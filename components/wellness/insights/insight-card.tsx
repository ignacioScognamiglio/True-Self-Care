"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, X } from "lucide-react";

const DOMAIN_COLORS: Record<string, string> = {
  sueno:
    "bg-indigo-500/15 text-indigo-600 border-indigo-500/30 dark:text-indigo-400",
  nutricion:
    "bg-wellness-nutrition/15 text-wellness-nutrition border-wellness-nutrition/30",
  fitness:
    "bg-wellness-fitness/15 text-wellness-fitness border-wellness-fitness/30",
  animo:
    "bg-wellness-mental/15 text-wellness-mental border-wellness-mental/30",
  habitos:
    "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400",
  hidratacion:
    "bg-wellness-hydration/15 text-wellness-hydration border-wellness-hydration/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

interface InsightCardProps {
  title: string;
  body: string;
  domains?: string[];
  priority?: "high" | "medium" | "low";
  onDismiss?: () => void;
}

export function InsightCard({
  title,
  body,
  domains = [],
  priority = "medium",
  onDismiss,
}: InsightCardProps) {
  return (
    <Card className="relative">
      <CardContent className="pt-0">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/15">
              <Lightbulb className="size-4 text-amber-500" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm leading-tight">{title}</h4>
              <span
                className={`size-2 shrink-0 rounded-full ${PRIORITY_COLORS[priority]}`}
                title={
                  priority === "high"
                    ? "Prioridad alta"
                    : priority === "medium"
                      ? "Prioridad media"
                      : "Prioridad baja"
                }
              />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {body}
            </p>

            {domains.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {domains.map((domain) => (
                  <Badge
                    key={domain}
                    variant="outline"
                    className={`text-xs ${DOMAIN_COLORS[domain] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {domain}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
            >
              <X className="size-3.5" />
              <span className="sr-only">Descartar</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
