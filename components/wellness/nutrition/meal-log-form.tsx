"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Almuerzo" },
  { value: "dinner", label: "Cena" },
  { value: "snack", label: "Snack" },
] as const;

const mealSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  calories: z.number().min(0, "Minimo 0").max(10000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof mealSchema>;

interface MealLogFormProps {
  defaultValues?: Partial<FormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MealLogForm({
  defaultValues,
  onSuccess,
  onCancel,
}: MealLogFormProps) {
  const logMeal = useMutation(api.functions.nutrition.logMealEntryPublic);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealType: "lunch",
      description: "",
      ...defaultValues,
    },
  });

  const mealType = watch("mealType");

  async function onSubmit(data: FormData) {
    await logMeal({
      meal: {
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        mealType: data.mealType,
        description: data.description || undefined,
      },
    });
    toast.success("Comida registrada");
    reset();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="meal-name">Nombre</Label>
        <Input
          id="meal-name"
          placeholder="Ej: Ensalada cesar con pollo"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tipo de comida</Label>
        <Select
          value={mealType}
          onValueChange={(val) =>
            setValue("mealType", val as FormData["mealType"])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEAL_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calorias (kcal)</Label>
          <Input
            id="calories"
            type="number"
            min={0}
            step={1}
            {...register("calories", { valueAsNumber: true })}
          />
          {errors.calories && (
            <p className="text-sm text-destructive">
              {errors.calories.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein">Proteina (g)</Label>
          <Input
            id="protein"
            type="number"
            min={0}
            step={0.1}
            {...register("protein", { valueAsNumber: true })}
          />
          {errors.protein && (
            <p className="text-sm text-destructive">
              {errors.protein.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs">Carbohidratos (g)</Label>
          <Input
            id="carbs"
            type="number"
            min={0}
            step={0.1}
            {...register("carbs", { valueAsNumber: true })}
          />
          {errors.carbs && (
            <p className="text-sm text-destructive">{errors.carbs.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat">Grasas (g)</Label>
          <Input
            id="fat"
            type="number"
            min={0}
            step={0.1}
            {...register("fat", { valueAsNumber: true })}
          />
          {errors.fat && (
            <p className="text-sm text-destructive">{errors.fat.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripcion (opcional)</Label>
        <Textarea
          id="description"
          placeholder="Detalles adicionales sobre la comida..."
          rows={2}
          {...register("description")}
        />
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar comida"}
        </Button>
      </div>
    </form>
  );
}
