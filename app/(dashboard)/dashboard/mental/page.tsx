import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function MentalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mental Health</h2>
        <p className="text-muted-foreground">
          Mood tracking, journaling and mindfulness
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5 text-wellness-mental" />
            Mental Health
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Mental Health — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
