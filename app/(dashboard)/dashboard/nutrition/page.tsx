import dynamic from "next/dynamic";
import { NutritionStats } from "@/components/wellness/nutrition/nutrition-stats";
import { DailyMacros } from "@/components/wellness/nutrition/daily-macros";
import { TodayMeals } from "@/components/wellness/nutrition/today-meals";
import { FoodPhotosSection } from "@/components/wellness/nutrition/food-photos-section";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Sparkles } from "lucide-react";
import Link from "next/link";
import { ChartSkeleton } from "@/components/ui/loading-skeletons";

const WeeklyNutritionChart = dynamic(
  () =>
    import("@/components/wellness/nutrition/weekly-nutrition-chart").then(
      (mod) => ({ default: mod.WeeklyNutritionChart })
    ),
  { loading: () => <ChartSkeleton /> }
);

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nutricion</h2>
          <p className="text-muted-foreground">
            Registro y seguimiento de tu alimentacion
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/nutrition/plans">
              <Sparkles className="size-4 mr-1" />
              Plan
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/nutrition/log?mode=photo">
              <Camera className="size-4 mr-1" />
              Foto
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/nutrition/log">
              <Plus className="size-4 mr-1" />
              Registrar
            </Link>
          </Button>
        </div>
      </div>

      <NutritionStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <DailyMacros />
        <WeeklyNutritionChart />
      </div>

      <TodayMeals />

      <FoodPhotosSection />
    </div>
  );
}
