"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap } from "lucide-react";

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

export function UsageStats() {
  const status = useQuery(api.chat.getRateLimitStatus);

  if (status === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const dailyColor =
    status.dailyPercent >= 0.9
      ? "text-destructive"
      : status.dailyPercent >= 0.7
        ? "text-yellow-600"
        : "text-muted-foreground";

  const monthlyColor =
    status.monthlyPercent >= 0.9
      ? "text-destructive"
      : status.monthlyPercent >= 0.7
        ? "text-yellow-600"
        : "text-muted-foreground";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-5" />
          Uso de IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uso diario</span>
            <span className={dailyColor}>
              {formatTokens(status.dailyUsed)} /{" "}
              {formatTokens(status.dailyLimit)} tokens
            </span>
          </div>
          <Progress
            value={status.dailyPercent * 100}
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uso mensual</span>
            <span className={monthlyColor}>
              {formatTokens(status.monthlyUsed)} /{" "}
              {formatTokens(status.monthlyLimit)} tokens
            </span>
          </div>
          <Progress
            value={status.monthlyPercent * 100}
            className="h-2"
          />
        </div>

        {!status.allowed && (
          <p className="text-sm text-destructive">
            Has alcanzado tu limite. El uso se reinicia diariamente.
          </p>
        )}
        {status.shouldDegrade && status.allowed && (
          <p className="text-sm text-yellow-600">
            Estas cerca del limite. Las respuestas pueden ser mas breves.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
