"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function ComparisonPanel({
  type,
}: {
  type: "body" | "food";
}) {
  const comparison = useQuery(api.functions.progress.getPhotoComparison, {
    type,
  });

  if (comparison === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <ImageIcon className="size-8" />
        <p className="text-sm">
          Necesitas al menos 2 fotos de cuerpo para comparar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground text-center">
            Antes
          </p>
          {comparison.before.url ? (
            <img
              src={comparison.before.url}
              alt="Antes"
              className="aspect-[3/4] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground">
            {format(comparison.before.timestamp, "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground text-center">
            Despues
          </p>
          {comparison.after.url ? (
            <img
              src={comparison.after.url}
              alt="Despues"
              className="aspect-[3/4] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground">
            {format(comparison.after.timestamp, "d MMM yyyy", { locale: es })}
          </p>
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {comparison.daysDiff} dias de diferencia
      </p>
    </div>
  );
}

export function BeforeAfterComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparacion antes/despues</CardTitle>
      </CardHeader>
      <CardContent>
        <ComparisonPanel type="body" />
      </CardContent>
    </Card>
  );
}
