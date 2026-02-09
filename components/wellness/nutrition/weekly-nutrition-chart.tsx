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
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  calorias: { label: "Calorias (kcal)", color: "hsl(220, 14%, 46%)" },
  proteina: { label: "Proteina (g)", color: "hsl(142, 76%, 36%)" },
  carbohidratos: { label: "Carbohidratos (g)", color: "hsl(48, 96%, 53%)" },
  grasas: { label: "Grasas (g)", color: "hsl(25, 95%, 53%)" },
} satisfies ChartConfig;

export function WeeklyNutritionChart() {
  const history = useQuery(api.functions.nutrition.getNutritionHistory, {
    days: 7,
  });

  if (!history) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencia semanal</CardTitle>
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
    calorias: day.totalCalories,
    proteina: day.totalProtein,
    carbohidratos: day.totalCarbs,
    grasas: day.totalFat,
  }));

  const hasData = data.some(
    (d) => d.calorias > 0 || d.proteina > 0 || d.carbohidratos > 0 || d.grasas > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tendencia semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin datos esta semana
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="proteina"
                  stroke="var(--color-proteina)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="carbohidratos"
                  stroke="var(--color-carbohidratos)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="grasas"
                  stroke="var(--color-grasas)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
              {(["proteina", "carbohidratos", "grasas"] as const).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: chartConfig[key].color }}
                  />
                  <span className="text-muted-foreground">
                    {chartConfig[key].label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
