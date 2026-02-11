import { GoogleFitConnect } from "@/components/wellness/google-fit/google-fit-connect";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { ModulePreferences } from "@/components/settings/module-preferences";
import { UnitSystemToggle } from "@/components/settings/unit-system-toggle";
import { LanguageSelector } from "@/components/settings/language-selector";
import { ProfileEditor } from "@/components/settings/profile-editor";
import { DataExport } from "@/components/settings/data-export";
import { AccountDeletion } from "@/components/settings/account-deletion";
import { UsageStats } from "@/components/settings/usage-stats";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuracion</h2>
        <p className="text-muted-foreground">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Perfil */}
      <ProfileEditor />

      {/* Modulos */}
      <ModulePreferences />

      {/* Preferencias */}
      <div className="grid gap-4 sm:grid-cols-2">
        <UnitSystemToggle />
        <LanguageSelector />
      </div>

      {/* Notificaciones */}
      <NotificationPreferences />

      {/* Uso de IA */}
      <UsageStats />

      {/* Integraciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Integraciones</h3>
        <GoogleFitConnect />
      </div>

      {/* Datos y privacidad */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Datos y privacidad</h3>
        <DataExport />
        <AccountDeletion />
      </div>
    </div>
  );
}
