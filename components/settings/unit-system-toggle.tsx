"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export function UnitSystemToggle() {
  const user = useQuery(api.users.getCurrentUser);
  const updatePreferences = useMutation(api.users.updatePreferences);

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const unitSystem = user.preferences?.unitSystem ?? "metric";
  const isImperial = unitSystem === "imperial";

  const handleToggle = async (checked: boolean) => {
    await updatePreferences({
      unitSystem: checked ? "imperial" : "metric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sistema de unidades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">
              {isImperial ? "Imperial" : "Metrico"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isImperial
                ? "Libras, pies, Fahrenheit"
                : "Kilogramos, metros, Celsius"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Metrico</span>
            <Switch checked={isImperial} onCheckedChange={handleToggle} />
            <span className="text-sm text-muted-foreground">Imperial</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
