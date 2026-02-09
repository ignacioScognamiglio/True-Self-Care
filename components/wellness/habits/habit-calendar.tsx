"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Calendar } from "@/components/ui/calendar";
import { startOfMonth, endOfMonth, getDaysInMonth, startOfDay } from "date-fns";

interface HabitCalendarProps {
  habitId: Id<"habits">;
}

export function HabitCalendar({ habitId }: HabitCalendarProps) {
  const [month, setMonth] = useState(new Date());

  const range = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return { startDate: start.getTime(), endDate: end.getTime() };
  }, [month]);

  const completions = useQuery(api.functions.habits.getHabitCompletions, {
    habitId,
    ...range,
  });

  const completedDays = useMemo(() => {
    if (!completions) return [];
    const unique = new Set(
      completions.map((c) => startOfDay(new Date(c.timestamp)).getTime())
    );
    return Array.from(unique).map((t) => new Date(t));
  }, [completions]);

  const daysInMonth = getDaysInMonth(month);
  const completedCount = completedDays.length;
  const rate = daysInMonth > 0 ? Math.round((completedCount / daysInMonth) * 100) : 0;

  return (
    <div className="space-y-2">
      <Calendar
        mode="multiple"
        selected={completedDays}
        month={month}
        onMonthChange={setMonth}
        captionLayout="label"
        classNames={{
          day: "relative w-full h-full p-0 text-center group/day aspect-square select-none",
        }}
      />
      <p className="text-xs text-muted-foreground text-center">
        {completedCount}/{daysInMonth} dias ({rate}%)
      </p>
    </div>
  );
}
