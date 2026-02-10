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
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
} from "recharts";

const chartConfig = {
  duracion: {
    label: "Duracion (h)",
    color: "hsl(230, 60%, 55%)",
  },
  calidad: {
    label: "Calidad (%)",
    color: "hsl(45, 93%, 47%)",
  },
} satisfies ChartConfig;

export function SleepChart() {
  const { results: history, status } = usePaginatedQuery(
    api.functions.sleep.getSleepHistory,
    { days: 7 },
    { initialNumItems: 200 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sueno semanal</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  const data = history.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("es-AR", {
      weekday: "short",
    }),
    duracion: Math.round((entry.durationMinutes / 60) * 10) / 10,
    calidad: entry.qualityScore,
  }));

  const hasData = data.some((d) => d.duracion > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sueno semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin datos esta semana
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ComposedChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  domain={[0, 12]}
                  label={{
                    value: "h",
                    position: "insideTopLeft",
                    offset: -5,
                    style: { fontSize: 10, fill: "var(--muted-foreground)" },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  domain={[0, 100]}
                  label={{
                    value: "%",
                    position: "insideTopRight",
                    offset: -5,
                    style: { fontSize: 10, fill: "var(--muted-foreground)" },
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceArea
                  yAxisId="left"
                  y1={7}
                  y2={9}
                  fill="hsl(142, 76%, 36%)"
                  fillOpacity={0.1}
                  stroke="none"
                />
                <Bar
                  yAxisId="left"
                  dataKey="duracion"
                  fill="var(--color-duracion)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calidad"
                  stroke="var(--color-calidad)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-calidad)" }}
                />
              </ComposedChart>
            </ChartContainer>

            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
              {(["duracion", "calidad"] as const).map((key) => (
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
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: "hsl(142, 76%, 36%)" }}
                />
                <span className="text-muted-foreground">Rango optimo (7-9h)</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
