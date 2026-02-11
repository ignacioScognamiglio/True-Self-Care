import { GoalsManagement } from "@/components/progress/goals-management";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Progreso</h2>
        <p className="text-muted-foreground">
          Seguimiento de tus metas y progreso general
        </p>
      </div>

      <GoalsManagement />
    </div>
  );
}
