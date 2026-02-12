"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const MODULES = [
  {
    id: "nutrition",
    label: "Nutricion",
    description: "Registro de comidas, macros y planes alimentarios",
  },
  {
    id: "fitness",
    label: "Fitness",
    description: "Entrenamientos, ejercicio y actividad fisica",
  },
  {
    id: "mental",
    label: "Salud Mental",
    description: "Estado de animo, journaling y bienestar emocional",
  },
  {
    id: "sleep",
    label: "Sueno",
    description: "Calidad de sueno y rutinas nocturnas",
  },
  {
    id: "habits",
    label: "Habitos",
    description: "Seguimiento de habitos diarios y rachas",
  },
] as const;

export function ModulePreferences() {
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

  const activeModules = user.preferences?.activeModules ?? [];

  const handleToggle = async (moduleId: string, checked: boolean) => {
    const updated = checked
      ? [...activeModules, moduleId]
      : activeModules.filter((m) => m !== moduleId);
    await updatePreferences({ activeModules: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modulos activos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Selecciona los modulos que quieres usar. Esto personaliza tu
          experiencia y las notificaciones que recibis.
        </p>
        <div className="space-y-3">
          {MODULES.map((mod) => (
            <div key={mod.id} className="flex items-start gap-3">
              <Checkbox
                id={`module-${mod.id}`}
                checked={activeModules.includes(mod.id)}
                onCheckedChange={(checked) =>
                  handleToggle(mod.id, checked === true)
                }
              />
              <div className="grid gap-0.5">
                <Label
                  htmlFor={`module-${mod.id}`}
                  className="text-sm font-medium leading-none"
                >
                  {mod.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {mod.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
