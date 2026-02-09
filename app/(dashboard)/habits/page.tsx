import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Habits</h2>
        <p className="text-muted-foreground">
          Build and track daily habits
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Habits Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Habits Tracker — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
