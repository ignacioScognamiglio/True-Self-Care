"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, RotateCcw } from "lucide-react";

interface FoodAnalysisResultProps {
  analysis: {
    foods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description: string;
    mealType: string;
    storageId: string;
  };
  onSave: () => void;
  onEdit: () => void;
  onRetry: () => void;
}

const MACRO_ROWS = [
  { label: "Calorias", key: "calories", unit: "kcal" },
  { label: "Proteina", key: "protein", unit: "g" },
  { label: "Carbohidratos", key: "carbs", unit: "g" },
  { label: "Grasas", key: "fat", unit: "g" },
] as const;

export function FoodAnalysisResult({
  analysis,
  onSave,
  onEdit,
  onRetry,
}: FoodAnalysisResultProps) {
  const photoUrl = useQuery(api.functions.files.getUrl, {
    storageId: analysis.storageId,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resultado del analisis</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Photo + description */}
        <div className="flex gap-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Comida analizada"
              className="size-20 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm">{analysis.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.foods.map((food) => (
                <Badge key={food} variant="secondary" className="text-xs">
                  {food}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Nutritional table */}
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Nutriente</th>
                <th className="px-3 py-2 text-right font-medium">
                  Estimacion
                </th>
              </tr>
            </thead>
            <tbody>
              {MACRO_ROWS.map((row) => (
                <tr key={row.key} className="border-b last:border-0">
                  <td className="px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {analysis[row.key]} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground">
          Estimacion basada en analisis visual. Los valores reales pueden variar.
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button size="sm" onClick={onSave} className="gap-1.5">
          <Check className="size-4" />
          Registrar
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="gap-1.5"
        >
          <RotateCcw className="size-4" />
          Reintentar
        </Button>
      </CardFooter>
    </Card>
  );
}
