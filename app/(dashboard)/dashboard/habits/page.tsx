"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Droplets } from "lucide-react";
import { HabitStats } from "@/components/wellness/habits/habit-stats";
import { HabitList } from "@/components/wellness/habits/habit-list";
import { WaterTracker } from "@/components/wellness/hydration/water-tracker";
import { QuickAddButtons } from "@/components/wellness/hydration/quick-add-buttons";
import { TodayLog } from "@/components/wellness/hydration/today-log";
import { WaterHistory } from "@/components/wellness/hydration/water-history";

export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Habitos</h2>
        <p className="text-muted-foreground">
          Construye y rastrea tus habitos diarios
        </p>
      </header>

      <HabitStats />
      <HabitList />

      <Separator />

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Droplets className="size-5 text-wellness-hydration" />
          Hidratacion
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <WaterTracker />
              <QuickAddButtons />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Registro de hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <TodayLog />
            </CardContent>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Ultimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
