"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

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

interface MealPlanEditorProps {
  planId: Id<"aiPlans">;
  initialContent: PlanContent;
  onClose: () => void;
}

export function MealPlanEditor({
  planId,
  initialContent,
  onClose,
}: MealPlanEditorProps) {
  const updateContent = useMutation(api.functions.plans.updatePlanContent);
  const [content, setContent] = useState<PlanContent>(
    JSON.parse(JSON.stringify(initialContent))
  );
  const [isSaving, setIsSaving] = useState(false);

  function updateDay(dayIndex: number, updatedDay: DayPlan) {
    setContent((prev) => ({
      ...prev,
      days: prev.days.map((d, i) => (i === dayIndex ? updatedDay : d)),
    }));
  }

  function updateMeal(dayIndex: number, mealIndex: number, updatedMeal: Meal) {
    const day = content.days[dayIndex];
    updateDay(dayIndex, {
      ...day,
      meals: day.meals.map((m, i) => (i === mealIndex ? updatedMeal : m)),
    });
  }

  function addMeal(dayIndex: number) {
    const day = content.days[dayIndex];
    updateDay(dayIndex, {
      ...day,
      meals: [
        ...day.meals,
        {
          name: "",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealType: "snack",
        },
      ],
    });
  }

  function removeMeal(dayIndex: number, mealIndex: number) {
    const day = content.days[dayIndex];
    updateDay(dayIndex, {
      ...day,
      meals: day.meals.filter((_, i) => i !== mealIndex),
    });
  }

  function addDay() {
    setContent((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        { day: `Dia ${prev.days.length + 1}`, meals: [] },
      ],
    }));
  }

  function removeDay(dayIndex: number) {
    setContent((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== dayIndex),
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateContent({ planId, content });
      toast.success("Plan actualizado");
      onClose();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Title and objective */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Input
            value={content.title}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Titulo del plan"
            className="font-medium"
          />
          <Textarea
            value={content.objective ?? ""}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, objective: e.target.value }))
            }
            placeholder="Objetivo del plan"
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Days */}
      {content.days.map((day, dayIndex) => (
        <Card key={dayIndex}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <Input
                value={day.day}
                onChange={(e) =>
                  updateDay(dayIndex, { ...day, day: e.target.value })
                }
                className="h-8 font-medium border-0 px-0 focus-visible:ring-0 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeDay(dayIndex)}
                aria-label="Eliminar dia"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {day.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="rounded-md border p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={meal.name}
                    onChange={(e) =>
                      updateMeal(dayIndex, mealIndex, {
                        ...meal,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nombre de la comida"
                    className="h-7 text-sm flex-1"
                  />
                  <select
                    value={meal.mealType}
                    onChange={(e) =>
                      updateMeal(dayIndex, mealIndex, {
                        ...meal,
                        mealType: e.target.value,
                      })
                    }
                    className="h-7 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="breakfast">Desayuno</option>
                    <option value="lunch">Almuerzo</option>
                    <option value="dinner">Cena</option>
                    <option value="snack">Snack</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => removeMeal(dayIndex, mealIndex)}
                    aria-label="Eliminar comida"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Kcal
                    </label>
                    <Input
                      type="number"
                      value={meal.calories}
                      onChange={(e) =>
                        updateMeal(dayIndex, mealIndex, {
                          ...meal,
                          calories: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs text-center"
                      min={0}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Prot(g)
                    </label>
                    <Input
                      type="number"
                      value={meal.protein}
                      onChange={(e) =>
                        updateMeal(dayIndex, mealIndex, {
                          ...meal,
                          protein: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs text-center"
                      min={0}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Carb(g)
                    </label>
                    <Input
                      type="number"
                      value={meal.carbs}
                      onChange={(e) =>
                        updateMeal(dayIndex, mealIndex, {
                          ...meal,
                          carbs: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs text-center"
                      min={0}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-muted-foreground">
                      Gras(g)
                    </label>
                    <Input
                      type="number"
                      value={meal.fat}
                      onChange={(e) =>
                        updateMeal(dayIndex, mealIndex, {
                          ...meal,
                          fat: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs text-center"
                      min={0}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => addMeal(dayIndex)}
            >
              <Plus className="size-3 mr-1" />
              Agregar comida
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Add day */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addDay}
      >
        <Plus className="size-3.5 mr-1" />
        Agregar dia
      </Button>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isSaving}
        >
          <X className="size-4 mr-1" />
          Cancelar
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="size-4 mr-1" />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
