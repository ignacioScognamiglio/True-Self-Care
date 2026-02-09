import { MealPlanView } from "@/components/wellness/nutrition/meal-plan-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NutritionPlansPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/nutrition">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Plan de comidas
          </h2>
          <p className="text-muted-foreground">
            Tu plan nutricional generado por IA
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/chat">
            <Sparkles className="size-4 mr-1" />
            Generar con IA
          </Link>
        </Button>
      </div>

      <MealPlanView />
    </div>
  );
}
