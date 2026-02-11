"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Loader2, Flame } from "lucide-react";

const chartConfig = {
  currentStreak: { label: "Racha actual", color: "hsl(142, 76%, 36%)" },
  longestStreak: { label: "Mejor racha", color: "hsl(220, 14%, 70%)" },
} satisfies ChartConfig;

export function StreakHistoryChart() {
  const data = useQuery(api.functions.progress.getStreakHistory);

  if (data === undefined) {
    return (
      <Card>
        <CardContent className="flex h-[200px] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="size-5" />
            Rachas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay habitos activos. Crea habitos para ver tus rachas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((h) => ({
    name: h.name.length > 12 ? h.name.slice(0, 12) + "..." : h.name,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-5" />
          Rachas de habitos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="currentStreak"
              fill="var(--color-currentStreak)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="longestStreak"
              fill="var(--color-longestStreak)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
