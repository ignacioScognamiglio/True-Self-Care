"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FoodAnalysisValues {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  mealType: string;
  storageId: string;
}

interface FoodAnalysisEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoId: Id<"progressPhotos">;
  initialValues: FoodAnalysisValues;
  onSaved?: (values: FoodAnalysisValues) => void;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Almuerzo" },
  { value: "dinner", label: "Cena" },
  { value: "snack", label: "Snack" },
];

export function FoodAnalysisEditor({
  open,
  onOpenChange,
  photoId,
  initialValues,
  onSaved,
}: FoodAnalysisEditorProps) {
  const updateAnalysis = useMutation(
    api.functions.foodAnalysis.updateFoodPhotoAnalysis
  );
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<FoodAnalysisValues>(initialValues);

  const handleNumberChange = (
    field: "calories" | "protein" | "carbs" | "fat",
    raw: string
  ) => {
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      setValues((v) => ({ ...v, [field]: num }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAnalysis({ photoId, analysis: values });
      toast.success("Valores actualizados");
      onSaved?.(values);
      onOpenChange(false);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar valores nutricionales</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripcion</Label>
            <Input
              id="edit-description"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de comida</Label>
            <Select
              value={values.mealType}
              onValueChange={(val) =>
                setValues((v) => ({ ...v, mealType: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((mt) => (
                  <SelectItem key={mt.value} value={mt.value}>
                    {mt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-calories">Calorias (kcal)</Label>
              <Input
                id="edit-calories"
                type="number"
                min={0}
                value={values.calories}
                onChange={(e) => handleNumberChange("calories", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-protein">Proteina (g)</Label>
              <Input
                id="edit-protein"
                type="number"
                min={0}
                value={values.protein}
                onChange={(e) => handleNumberChange("protein", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-carbs">Carbohidratos (g)</Label>
              <Input
                id="edit-carbs"
                type="number"
                min={0}
                value={values.carbs}
                onChange={(e) => handleNumberChange("carbs", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-fat">Grasas (g)</Label>
              <Input
                id="edit-fat"
                type="number"
                min={0}
                value={values.fat}
                onChange={(e) => handleNumberChange("fat", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-foods">
              Alimentos (separados por coma)
            </Label>
            <Input
              id="edit-foods"
              value={values.foods.join(", ")}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  foods: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
