"use client";

import { ActiveWorkout } from "@/components/wellness/fitness/active-workout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkoutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/fitness">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout activo</h2>
          <p className="text-muted-foreground">
            Registra tu entrenamiento en tiempo real
          </p>
        </div>
      </div>
      <ActiveWorkout />
    </div>
  );
}
