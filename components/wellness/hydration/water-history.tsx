"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

const DAILY_GOAL_ML = 2500;

const chartConfig = {
  agua: {
    label: "Agua",
    color: "var(--color-wellness-hydration)",
  },
} satisfies ChartConfig;

export function WaterHistory() {
  const history = useQuery(api.functions.wellness.getWaterHistory);

  if (!history) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const data = history.map((day) => ({
    date: new Date(day.date).toLocaleDateString("es-AR", {
      weekday: "short",
    }),
    totalMl: day.totalMl,
  }));

  return (
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
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [`${value}ml`, "Agua"]}
            />
          }
        />
        <ReferenceLine
          y={DAILY_GOAL_ML}
          stroke="var(--color-wellness-hydration)"
          strokeDasharray="3 3"
          strokeOpacity={0.5}
        />
        <Bar
          dataKey="totalMl"
          fill="var(--color-agua)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
