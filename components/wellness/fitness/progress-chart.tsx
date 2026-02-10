"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  volumen: {
    label: "Volumen (kg)",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig;

export function ProgressChart() {
  const { results: history, status } = usePaginatedQuery(
    api.functions.fitness.getExerciseHistory,
    { days: 7 },
    { initialNumItems: 200 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Volumen semanal</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  const data = history.map((day) => ({
    date: new Date(day.date).toLocaleDateString("es-AR", {
      weekday: "short",
    }),
    volumen: day.totalVolume,
    ejercicios: day.exerciseCount,
    duracion: day.totalDuration,
  }));

  const hasData = data.some((d) => d.volumen > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Volumen semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin datos esta semana
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="volumen"
                fill="var(--color-volumen)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
