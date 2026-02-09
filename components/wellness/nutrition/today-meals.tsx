"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MealCard } from "./meal-card";

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
};

export function TodayMeals() {
  const meals = useQuery(api.functions.nutrition.getMealsByDate, {
    date: startOfDay(new Date()).getTime(),
  });

  if (!meals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comidas de hoy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  if (meals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comidas de hoy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No hay comidas registradas hoy
        </CardContent>
      </Card>
    );
  }

  // Group meals by type
  const grouped = MEAL_ORDER.reduce(
    (acc, type) => {
      const items = meals.filter((m) => (m.data as any)?.mealType === type);
      if (items.length > 0) acc.push({ type, items });
      return acc;
    },
    [] as Array<{ type: string; items: typeof meals }>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comidas de hoy</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.type}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {MEAL_LABELS[group.type] ?? group.type}
                </h4>
                <div className="space-y-2">
                  {group.items.map((meal) => (
                    <MealCard
                      key={meal._id}
                      meal={meal as any}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
