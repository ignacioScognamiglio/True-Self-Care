"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Snack",
};

interface PastFoodPhotosProps {
  onSelect?: (photoId: string) => void;
}

export function PastFoodPhotos({ onSelect }: PastFoodPhotosProps) {
  const photos = useQuery(api.functions.foodAnalysis.getPastFoodPhotos, {});

  if (!photos) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotos anteriores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <ImageIcon className="size-8" />
            <p className="text-sm">No hay fotos de comida aun</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fotos anteriores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => {
            const analysis = photo.aiAnalysis as any;
            return (
              <button
                key={photo._id}
                className="group relative overflow-hidden rounded-lg border bg-muted text-left transition-colors hover:border-primary"
                onClick={() => onSelect?.(photo._id)}
              >
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={analysis?.description ?? "Comida"}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center">
                    <ImageIcon className="size-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  {analysis && !analysis.error && (
                    <>
                      <p className="text-xs font-medium text-white truncate">
                        {analysis.calories} kcal
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0"
                        >
                          {MEAL_TYPE_LABELS[analysis.mealType] ??
                            analysis.mealType}
                        </Badge>
                        <span className="text-[10px] text-white/70">
                          {format(photo.timestamp, "d MMM", { locale: es })}
                        </span>
                      </div>
                    </>
                  )}
                  {analysis?.error && (
                    <p className="text-xs text-red-300">Error en analisis</p>
                  )}
                  {!analysis && (
                    <p className="text-xs text-white/70">Analizando...</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
