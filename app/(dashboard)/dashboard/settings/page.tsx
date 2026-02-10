import { GoogleFitConnect } from "@/components/wellness/google-fit/google-fit-connect";
import { NotificationPreferences } from "@/components/settings/notification-preferences";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuracion</h2>
        <p className="text-muted-foreground">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Notificaciones */}
      <NotificationPreferences />

      {/* Integraciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Integraciones</h3>
        <GoogleFitConnect />
      </div>
    </div>
  );
}
