"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Dumbbell, SmilePlus } from "lucide-react";
import { MentalHealthDisclaimer } from "@/components/wellness/mental/mental-health-disclaimer";
import { MentalStats } from "@/components/wellness/mental/mental-stats";
import { RecentCheckins } from "@/components/wellness/mental/recent-checkins";
import { ChartSkeleton } from "@/components/ui/loading-skeletons";

const MoodHistoryChart = dynamic(
  () =>
    import("@/components/wellness/mental/mood-history-chart").then((mod) => ({
      default: mod.MoodHistoryChart,
    })),
  { loading: () => <div className="h-[200px] bg-muted animate-pulse rounded" /> }
);

export default function MentalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Salud Mental</h2>
          <p className="text-muted-foreground">
            Check-in emocional, journaling y mindfulness
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/mental/journal">
              <BookOpen className="mr-2 size-4" />
              Journal
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/mental/exercises">
              <Dumbbell className="mr-2 size-4" />
              Ejercicios
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/mental/checkin">
              <SmilePlus className="mr-2 size-4" />
              Check-in
            </Link>
          </Button>
        </div>
      </div>

      <MentalHealthDisclaimer />

      <MentalStats />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tendencia semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodHistoryChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Check-ins de hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCheckins />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
