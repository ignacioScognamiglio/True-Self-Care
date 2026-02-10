"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, X, Clock } from "lucide-react";
import { toast } from "sonner";

const DIFFICULTY_STYLES: Record<string, string> = {
  facil: "bg-green-100 text-green-700",
  medio: "bg-yellow-100 text-yellow-700",
  dificil: "bg-red-100 text-red-700",
};

interface ChallengeCardProps {
  compact?: boolean;
}

export function ChallengeCard({ compact }: ChallengeCardProps) {
  const challenge = useQuery(api.functions.challenges.getActiveChallenge);
  const dismiss = useMutation(api.functions.challenges.dismissChallenge);

  if (challenge === undefined) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="size-4" />
            <p className="text-sm">
              No tenes un challenge activo. Se genera uno nuevo cada lunes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = challenge.expiresAt
    ? Math.max(0, Math.ceil((challenge.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isCompleted = challenge.progressPercent >= 100;

  async function handleDismiss() {
    await dismiss({ challengeId: challenge!._id });
    toast.success("Challenge descartado");
  }

  if (isCompleted) {
    return (
      <Card className="border-2 border-yellow-400">
        <CardContent className="p-4 text-center space-y-2">
          <Trophy className="size-8 text-yellow-500 mx-auto" />
          <p className="font-bold text-lg">Challenge Completado!</p>
          <p className="text-sm text-muted-foreground">{challenge.title}</p>
          <Badge className="bg-yellow-100 text-yellow-700">+{challenge.xpReward} XP</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-yellow-500" />
            <CardTitle className="text-sm font-medium">
              {compact ? "Challenge" : challenge.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={DIFFICULTY_STYLES[challenge.difficulty] ?? ""}>
              {challenge.difficulty}
            </Badge>
            {!compact && (
              <Button variant="ghost" size="icon" className="size-6" onClick={handleDismiss}>
                <X className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {compact && <p className="text-xs font-medium">{challenge.title}</p>}
        {!compact && (
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{challenge.currentValue}/{challenge.targetValue}</span>
            <span>{challenge.progressPercent}%</span>
          </div>
          <Progress value={challenge.progressPercent} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-yellow-600 font-medium">+{challenge.xpReward} XP</span>
          {daysRemaining !== null && (
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restante{daysRemaining !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {!compact && challenge.tips && challenge.tips.length > 0 && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium mb-1">Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {challenge.tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="shrink-0">-</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
