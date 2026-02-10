"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WorkoutSkeleton } from "@/components/ui/loading-skeletons";

const ActiveWorkout = dynamic(
  () =>
    import("@/components/wellness/fitness/active-workout").then((mod) => ({
      default: mod.ActiveWorkout,
    })),
  { loading: () => <WorkoutSkeleton /> }
);

export default function WorkoutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver a fitness">
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
