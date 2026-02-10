"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { InsightCard } from "./insight-card";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  sueno: ["sueno", "dormir", "descanso", "noche", "despertar"],
  nutricion: ["nutricion", "caloria", "proteina", "comida", "alimentacion", "comer"],
  fitness: ["ejercicio", "entrenamiento", "actividad", "volumen", "fitness"],
  animo: ["animo", "emocional", "humor", "mood", "sentir", "bienestar"],
  habitos: ["habito", "racha", "consistencia", "rutina"],
  hidratacion: ["agua", "hidratacion", "liquido", "ml"],
};

function detectDomains(title: string, body: string): string[] {
  const text = `${title} ${body}`.toLowerCase();
  const detected: string[] = [];

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      detected.push(domain);
    }
  }

  return detected.length > 0 ? detected : ["general"];
}

export function InsightsFeed() {
  const insights = useQuery(api.functions.insights.getRecentInsights, {});
  const dismissInsight = useMutation(api.functions.insights.dismissInsight);

  async function handleDismiss(notificationId: Id<"notifications">) {
    try {
      await dismissInsight({ notificationId });
      toast.success("Insight descartado");
    } catch {
      toast.error("Error al descartar el insight");
    }
  }

  // Loading state
  if (insights === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Filter to show only unread insights
  const unreadInsights = insights.filter((i) => !i.read);

  // Empty state
  if (unreadInsights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
            <Lightbulb className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Registra datos por al menos 5 dias para empezar a recibir insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {unreadInsights.map((insight) => {
        const domains = detectDomains(insight.title, insight.body);

        return (
          <InsightCard
            key={insight._id}
            title={insight.title}
            body={insight.body}
            domains={domains}
            priority="medium"
            onDismiss={() => handleDismiss(insight._id)}
          />
        );
      })}
    </div>
  );
}
