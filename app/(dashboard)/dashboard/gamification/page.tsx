"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XPBar } from "@/components/wellness/gamification/xp-bar";
import { LevelBadge } from "@/components/wellness/gamification/level-badge";
import { AchievementsGrid } from "@/components/wellness/gamification/achievements-grid";
import { ChallengeCard } from "@/components/wellness/gamification/challenge-card";
import { ChallengeHistory } from "@/components/wellness/gamification/challenge-history";
import { StreakDisplay } from "@/components/wellness/gamification/streak-display";
import { StreakFreezeButton } from "@/components/wellness/gamification/streak-freeze-button";
import { Zap, Trophy, Award, Target } from "lucide-react";

export default function GamificationPage() {
  const profile = useQuery(api.functions.gamification.getGamificationProfile);
  const achievements = useQuery(api.functions.gamification.getAvailableAchievements);
  const challenges = useQuery(api.functions.challenges.getChallenges, { limit: 10 });

  const earnedCount = achievements?.filter((a) => a.earned).length ?? 0;
  const totalAchievements = achievements?.length ?? 25;
  const completedChallenges = challenges?.filter((c) => c.status === "completed").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gamificacion</h2>
        <p className="text-muted-foreground">Tu progreso personal</p>
      </div>

      {/* XP Bar + Level Badge + Streak */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {profile && <LevelBadge level={profile.level} size="lg" />}
            <div className="flex-1 space-y-3">
              <XPBar />
              <div className="flex items-center justify-between flex-wrap gap-2">
                <StreakDisplay />
                <StreakFreezeButton />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge + Quick Stats */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChallengeCard />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estadisticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Zap className="size-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">XP Total</span>
                </div>
                <p className="text-2xl font-bold">
                  {profile?.totalXP.toLocaleString() ?? "0"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Target className="size-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Nivel</span>
                </div>
                <p className="text-2xl font-bold">{profile?.level ?? 1}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Award className="size-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Logros</span>
                </div>
                <p className="text-2xl font-bold">
                  {earnedCount}/{totalAchievements}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="size-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Challenges</span>
                </div>
                <p className="text-2xl font-bold">{completedChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Logros</CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementsGrid />
        </CardContent>
      </Card>

      {/* Challenge History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <ChallengeHistory />
        </CardContent>
      </Card>
    </div>
  );
}
