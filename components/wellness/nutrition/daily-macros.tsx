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
import { PieChart, Pie, Cell, Label } from "recharts";

const chartConfig = {
  proteina: { label: "Proteina", color: "hsl(142, 76%, 36%)" },
  carbohidratos: { label: "Carbohidratos", color: "hsl(48, 96%, 53%)" },
  grasas: { label: "Grasas", color: "hsl(25, 95%, 53%)" },
} satisfies ChartConfig;

const COLORS = [
  chartConfig.proteina.color,
  chartConfig.carbohidratos.color,
  chartConfig.grasas.color,
];

export function DailyMacros() {
  const summary = useQuery(
    api.functions.nutrition.getTodayNutritionSummaryPublic
  );

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Macros de hoy</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  const totalGrams =
    summary.totalProtein + summary.totalCarbs + summary.totalFat;

  const data = [
    { name: "Proteina", value: summary.totalProtein, key: "proteina" },
    { name: "Carbohidratos", value: summary.totalCarbs, key: "carbohidratos" },
    { name: "Grasas", value: summary.totalFat, key: "grasas" },
  ];

  const pct = (val: number) =>
    totalGrams > 0 ? Math.round((val / totalGrams) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Macros de hoy</CardTitle>
      </CardHeader>
      <CardContent>
        {totalGrams === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin datos de macros hoy
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto h-[200px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}g`, ""]}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={85}
                  strokeWidth={2}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.key} fill={COLORS[i]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {summary.totalCalories}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              kcal
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6 text-sm">
              {data.map((entry, i) => (
                <div key={entry.key} className="flex items-center gap-1.5">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span className="text-muted-foreground">
                    {entry.name}: {entry.value}g ({pct(entry.value)}%)
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
