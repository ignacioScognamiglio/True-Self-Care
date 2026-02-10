"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function FitnessHistoryPage() {
  const history = useQuery(api.functions.fitness.getExerciseHistory, {
    days: 30,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver a fitness">
          <Link href="/dashboard/fitness">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historial</h2>
          <p className="text-muted-foreground">Tu progreso de entrenamiento</p>
        </div>
      </div>

      {!history ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Cargando...
          </CardContent>
        </Card>
      ) : history.every((d) => d.exerciseCount === 0) ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No hay entrenamientos registrados
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history
            .filter((day) => day.exerciseCount > 0)
            .map((day) => (
              <Card key={day.date}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Dumbbell className="size-3.5" />
                      <span>
                        {day.exerciseCount}{" "}
                        {day.exerciseCount === 1 ? "ejercicio" : "ejercicios"}
                      </span>
                    </div>
                    {day.totalDuration > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>{day.totalDuration} min</span>
                      </div>
                    )}
                    {day.totalVolume > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="size-3.5" />
                        <span>{day.totalVolume} kg vol.</span>
                      </div>
                    )}
                    {day.totalCaloriesBurned > 0 && (
                      <div className="text-muted-foreground">
                        {day.totalCaloriesBurned} kcal
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
