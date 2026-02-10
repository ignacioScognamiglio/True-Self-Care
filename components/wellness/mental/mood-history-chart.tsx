"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  intensidad: {
    label: "Intensidad",
    color: "var(--color-wellness-mental)",
  },
} satisfies ChartConfig;

const MOOD_EMOJIS: Record<string, string> = {
  feliz: "\u{1F60A}",
  calmado: "\u{1F60C}",
  neutral: "\u{1F610}",
  triste: "\u{1F622}",
  ansioso: "\u{1F630}",
  enojado: "\u{1F621}",
  estresado: "\u{1F624}",
  agotado: "\u{1F634}",
};

export function MoodHistoryChart() {
  const history = useQuery(api.functions.mental.getMoodHistory, { days: 7 });

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
    intensidad: day.averageIntensity,
    mood: day.dominantMood,
    count: day.checkInCount,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <AreaChart data={data} accessibilityLayer>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-wellness-mental)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-wellness-mental)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={30}
          domain={[0, 10]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const mood = item.payload?.mood;
                const count = item.payload?.count;
                const emoji = mood ? MOOD_EMOJIS[mood] ?? "" : "";
                return [
                  `${value}/10`,
                  `${emoji} ${mood ?? "sin datos"} (${count} check-in${count !== 1 ? "s" : ""})`,
                ];
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="intensidad"
          stroke="var(--color-wellness-mental)"
          fill="url(#moodGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
