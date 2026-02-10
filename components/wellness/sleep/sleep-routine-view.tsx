"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Clock, Lightbulb, ShieldAlert } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  relajacion: "bg-purple-100 text-purple-800",
  higiene: "bg-blue-100 text-blue-800",
  preparacion: "bg-green-100 text-green-800",
  mindfulness: "bg-amber-100 text-amber-800",
  default: "bg-gray-100 text-gray-800",
};

export function SleepRoutineView() {
  const routine = useQuery(api.functions.plans.getActiveSleepRoutine);

  if (routine === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="size-4 text-wellness-sleep" />
            Rutina de sueno
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  if (!routine) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="size-4 text-wellness-sleep" />
            Rutina de sueno
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
          No tenes una rutina de sueno. Pedile una al asistente!
        </CardContent>
      </Card>
    );
  }

  const content = routine.content as any;
  const steps: Array<{
    time?: string;
    activity: string;
    duration?: string;
    category?: string;
  }> = content?.steps ?? content?.routine ?? [];
  const tips: string[] = content?.tips ?? [];
  const avoidFactors: string[] =
    content?.avoidFactors ?? content?.factores_evitar ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="size-4 text-wellness-sleep" />
          Rutina de sueno
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.length > 0 && (
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-2.5"
              >
                <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[50px]">
                  <Clock className="size-3" />
                  {step.time ?? "--:--"}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{step.activity}</p>
                  {step.duration != null && (
                    <p className="text-xs text-muted-foreground">
                      {typeof step.duration === "number"
                        ? `${step.duration} min`
                        : step.duration}
                    </p>
                  )}
                </div>
                {step.category && (
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${CATEGORY_COLORS[step.category] ?? CATEGORY_COLORS.default}`}
                  >
                    {step.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {tips.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Lightbulb className="size-3.5 text-amber-500" />
              Consejos
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground ml-5 list-disc">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {avoidFactors.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <ShieldAlert className="size-3.5 text-red-500" />
              Factores a evitar
            </div>
            <div className="flex flex-wrap gap-1.5">
              {avoidFactors.map((factor, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
