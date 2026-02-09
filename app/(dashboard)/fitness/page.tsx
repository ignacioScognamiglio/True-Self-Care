import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export default function FitnessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Fitness</h2>
        <p className="text-muted-foreground">
          Workout plans and exercise tracking
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="size-5 text-wellness-fitness" />
            Fitness Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Fitness Dashboard — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
