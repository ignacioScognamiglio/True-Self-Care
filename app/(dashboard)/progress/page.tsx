import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Progress</h2>
        <p className="text-muted-foreground">
          Track your overall wellness journey
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Progress Overview — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
