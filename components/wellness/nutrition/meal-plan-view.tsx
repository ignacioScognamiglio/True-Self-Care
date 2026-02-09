"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Archive, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MealPlanEditor } from "./meal-plan-editor";
import Link from "next/link";

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  ingredients?: string[];
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

interface PlanContent {
  title: string;
  objective?: string;
  days: DayPlan[];
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
};

export function MealPlanView() {
  const plan = useQuery(api.functions.plans.getActivePlanPublic, {
    type: "meal",
  });
  const updateStatus = useMutation(api.functions.plans.updatePlanStatus);
  const [isEditing, setIsEditing] = useState(false);

  if (plan === undefined) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  if (plan === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No tienes un plan de comidas activo.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/chat">
              <Sparkles className="size-4 mr-1" />
              Pedir al asistente
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const content = plan.content as PlanContent;

  if (isEditing) {
    return (
      <MealPlanEditor
        planId={plan._id}
        initialContent={content}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  async function handleArchive() {
    if (!plan) return;
    await updateStatus({ planId: plan._id, status: "archived" });
    toast.success("Plan archivado");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {content.title || "Plan de comidas"}
              </CardTitle>
              {content.objective && (
                <p className="text-sm text-muted-foreground">
                  {content.objective}
                </p>
              )}
            </div>
            <Badge variant="default">Activo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="size-3.5 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="size-3.5 mr-1" />
              Archivar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Days */}
      {content.days?.map((day, i) => {
        const dayCalories = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);

        return (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {dayCalories} kcal
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {day.meals.map((meal, j) => (
                  <div
                    key={j}
                    className="flex items-start justify-between rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{meal.name}</span>
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {meal.ingredients.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0 ml-3">
                      <div>{meal.calories} kcal</div>
                      <div>
                        P:{meal.protein}g C:{meal.carbs}g G:{meal.fat}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
