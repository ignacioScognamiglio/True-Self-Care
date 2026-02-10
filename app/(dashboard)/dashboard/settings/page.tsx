import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { GoogleFitConnect } from "@/components/wellness/google-fit/google-fit-connect";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuracion</h2>
        <p className="text-muted-foreground">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Integraciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Integraciones</h3>
        <GoogleFitConnect />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Mas opciones de configuracion proximamente
        </CardContent>
      </Card>
    </div>
  );
}
