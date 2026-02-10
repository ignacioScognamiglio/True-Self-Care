"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Sun, Moon, Sunset, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DailyPlanSection {
  period: "morning" | "afternoon" | "evening";
  label: string;
  icon: string;
  items: Array<{
    id: string;
    text: string;
    domain: string;
    completed: boolean;
    linkedAction?: string;
  }>;
}

interface DailyPlanContent {
  title: string;
  generatedAt: number;
  sections: DailyPlanSection[];
  insights: string[];
}

interface DailyPlanProps {
  compact?: boolean;
}

const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
} as const;

const PERIOD_COLORS = {
  morning: "text-amber-500",
  afternoon: "text-orange-500",
  evening: "text-indigo-500",
} as const;

const DOMAIN_COLORS: Record<string, string> = {
  hydration: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  nutrition: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  fitness: "bg-green-500/15 text-green-600 dark:text-green-400",
  sleep: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  habits: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  mental: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
};

export function DailyPlan({ compact }: DailyPlanProps) {
  const plan = useQuery(api.functions.plans.getActivePlanPublic, {
    type: "daily",
  });
  const updateContent = useMutation(api.functions.plans.updatePlanContent);

  // Loading state
  if (plan === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!plan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
            <CalendarDays className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm mb-1">Sin plan diario</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Tu plan diario se genera a las 6am. Asegurate de tener datos de al
            menos 3 dias.
          </p>
        </CardContent>
      </Card>
    );
  }

  const content = plan.content as DailyPlanContent;

  const generatedDate = new Date(content.generatedAt);
  const timeStr = generatedDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleToggle(sectionIdx: number, itemIdx: number) {
    if (!plan) return;
    const updatedContent = { ...content };
    const sections = [...updatedContent.sections];
    const section = { ...sections[sectionIdx] };
    const items = [...section.items];
    items[itemIdx] = { ...items[itemIdx], completed: !items[itemIdx].completed };
    section.items = items;
    sections[sectionIdx] = section;
    updatedContent.sections = sections;

    try {
      await updateContent({
        planId: plan._id,
        content: updatedContent,
      });
    } catch {
      toast.error("Error al actualizar el plan");
    }
  }

  const totalItems = content.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const completedItems = content.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.completed).length,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{content.title}</CardTitle>
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles className="size-3" />
            Generado por IA
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Generado hoy a las {timeStr}
          </p>
          <p className="text-xs text-muted-foreground">
            {completedItems}/{totalItems} completados
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {content.sections.map((section, sectionIdx) => {
          const PeriodIcon = PERIOD_ICONS[section.period];
          const periodColor = PERIOD_COLORS[section.period];

          return (
            <div key={section.period} className="space-y-2">
              <div className="flex items-center gap-2">
                <PeriodIcon className={`size-4 ${periodColor}`} />
                <h4 className="text-sm font-semibold">{section.label}</h4>
              </div>

              <div className="space-y-1.5 ml-6">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2"
                  >
                    {!compact && (
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() =>
                          handleToggle(sectionIdx, itemIdx)
                        }
                        className="mt-0.5"
                      />
                    )}
                    <span
                      className={`text-sm leading-snug ${
                        item.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {item.text}
                    </span>
                    {!compact && (
                      <Badge
                        variant="outline"
                        className={`ml-auto shrink-0 text-[10px] px-1.5 py-0 ${DOMAIN_COLORS[item.domain] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {item.domain}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {content.insights && content.insights.length > 0 && (
          <div className="border-t pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Insights del dia
            </p>
            {content.insights.map((insight, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                {insight}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
