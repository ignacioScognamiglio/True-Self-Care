import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function SkincarePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skincare</h2>
        <p className="text-muted-foreground">
          AI-powered skin analysis and routines
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-wellness-skincare" />
            Skincare Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Skincare Dashboard — Coming soon
        </CardContent>
      </Card>
    </div>
  );
}
