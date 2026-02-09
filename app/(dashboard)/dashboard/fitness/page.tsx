import { FitnessStats } from "@/components/wellness/fitness/fitness-stats";
import { ProgressChart } from "@/components/wellness/fitness/progress-chart";
import { PersonalRecords } from "@/components/wellness/fitness/personal-records";
import { WorkoutPlanView } from "@/components/wellness/fitness/workout-plan-view";
import { Button } from "@/components/ui/button";
import { Dumbbell, History } from "lucide-react";
import Link from "next/link";

export default function FitnessPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fitness</h2>
          <p className="text-muted-foreground">
            Entrenamiento y progreso fisico
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/fitness/history">
              <History className="size-4 mr-1" />
              Historial
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/fitness/workout">
              <Dumbbell className="size-4 mr-1" />
              Iniciar workout
            </Link>
          </Button>
        </div>
      </div>

      <FitnessStats />
      <ProgressChart />
      <WorkoutPlanView />
      <PersonalRecords />
    </div>
  );
}
