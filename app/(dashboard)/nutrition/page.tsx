import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple } from "lucide-react";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nutrition</h2>
        <p className="text-muted-foreground">
          Meal tracking and AI nutrition plans
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="size-5 text-wellness-nutrition" />
            Nutrition Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Nutrition Dashboard — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
