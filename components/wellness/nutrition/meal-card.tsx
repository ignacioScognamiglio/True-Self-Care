"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Coffee, Cookie, X } from "lucide-react";
import { toast } from "sonner";

const MEAL_TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof Coffee }
> = {
  breakfast: { label: "Desayuno", icon: Coffee },
  lunch: { label: "Almuerzo", icon: UtensilsCrossed },
  dinner: { label: "Cena", icon: UtensilsCrossed },
  snack: { label: "Snack", icon: Cookie },
};

interface MealCardProps {
  meal: {
    _id: Id<"wellnessEntries">;
    data: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      mealType: string;
    };
    timestamp: number;
    source: string;
  };
}

export function MealCard({ meal }: MealCardProps) {
  const deleteMeal = useMutation(api.functions.nutrition.deleteMealEntry);

  const config = MEAL_TYPE_CONFIG[meal.data.mealType] ?? MEAL_TYPE_CONFIG.snack;
  const Icon = config.icon;

  const time = new Date(meal.timestamp).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleDelete() {
    await deleteMeal({ entryId: meal._id });
    toast.success("Comida eliminada");
  }

  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {meal.data.name}
            </span>
            {meal.source === "ai" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                IA
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{time}</span>
            <span>{meal.data.calories} kcal</span>
            <span className="hidden sm:inline">
              P:{meal.data.protein}g C:{meal.data.carbs}g G:{meal.data.fat}g
            </span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={handleDelete}
        aria-label="Eliminar comida"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
