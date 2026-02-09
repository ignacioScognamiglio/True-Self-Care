"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export function PersonalRecords() {
  const records = useQuery(api.functions.fitness.getPersonalRecords);

  if (!records) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-yellow-500" />
            Records personales
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-yellow-500" />
            Records personales
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Registra tu primer entrenamiento para ver tus records
        </CardContent>
      </Card>
    );
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-yellow-500" />
          Records personales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Ejercicio</th>
                <th className="pb-2 font-medium text-right">Peso</th>
                <th className="pb-2 font-medium text-right">Reps</th>
                <th className="pb-2 font-medium text-right">Volumen</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((pr) => {
                const isRecent = pr.date > sevenDaysAgo;
                return (
                  <tr key={pr.exerciseName} className="border-b last:border-0">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pr.exerciseName}</span>
                        {isRecent && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          >
                            Nuevo PR
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-right">{pr.bestWeight}kg</td>
                    <td className="py-2.5 text-right">{pr.bestReps}</td>
                    <td className="py-2.5 text-right">{pr.bestVolume}kg</td>
                    <td className="py-2.5 text-right hidden sm:table-cell text-muted-foreground">
                      {new Date(pr.date).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
