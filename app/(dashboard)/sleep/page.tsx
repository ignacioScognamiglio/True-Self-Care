import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from "lucide-react";

export default function SleepPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sleep</h2>
        <p className="text-muted-foreground">
          Sleep tracking and bedtime routines
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="size-5 text-wellness-sleep" />
            Sleep Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Sleep Dashboard — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
