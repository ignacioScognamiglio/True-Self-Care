"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Droplets,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  Moon,
  Sun,
  Lightbulb,
  ListChecks,
  Smartphone,
  Loader2,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationPreferences() {
  const user = useQuery(api.users.getCurrentUser);
  const updatePreferences = useMutation(api.users.updatePreferences);
  const {
    permission,
    isSupported,
    isSubscribed,
    subscriptionCount,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const notificationsEnabled = user.preferences?.notificationsEnabled ?? false;
  const activeModules = user.preferences?.activeModules ?? [];

  const handleMasterToggle = async (enabled: boolean) => {
    await updatePreferences({ notificationsEnabled: enabled });
  };

  const notificationTypes = [
    {
      key: "hydration",
      label: "Hidratacion",
      description: "Recordatorios de agua cada 2 horas",
      icon: Droplets,
      color: "text-blue-500",
      alwaysAvailable: true,
    },
    {
      key: "habits",
      label: "Habitos",
      description: "Habitos pendientes por la noche",
      icon: ListChecks,
      color: "text-green-500",
      alwaysAvailable: true,
    },
    {
      key: "nutrition",
      label: "Nutricion",
      description: "Recordatorio de registrar comidas",
      icon: UtensilsCrossed,
      color: "text-orange-500",
      module: "nutrition",
    },
    {
      key: "fitness",
      label: "Fitness",
      description: "Recordatorio de entrenamiento",
      icon: Dumbbell,
      color: "text-red-500",
      module: "fitness",
    },
    {
      key: "mental",
      label: "Salud Mental",
      description: "Check-in emocional diario",
      icon: Brain,
      color: "text-purple-500",
      module: "mental",
    },
    {
      key: "sleep",
      label: "Sueno",
      description: "Recordatorio de rutina de sueno",
      icon: Moon,
      color: "text-indigo-500",
      module: "sleep",
    },
    {
      key: "dailyPlan",
      label: "Plan diario",
      description: "Tu plan generado a las 6am",
      icon: Sun,
      color: "text-amber-500",
      alwaysAvailable: true,
    },
    {
      key: "insights",
      label: "Insights",
      description: "Nuevos insights cross-domain",
      icon: Lightbulb,
      color: "text-yellow-500",
      alwaysAvailable: true,
    },
  ];

  const availableTypes = notificationTypes.filter(
    (t) => t.alwaysAvailable || (t.module && activeModules.includes(t.module))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="master-notifications" className="text-base">
              Activar notificaciones
            </Label>
            <p className="text-sm text-muted-foreground">
              Recibir recordatorios y alertas en la app
            </p>
          </div>
          <Switch
            id="master-notifications"
            checked={notificationsEnabled}
            onCheckedChange={handleMasterToggle}
          />
        </div>

        <Separator />

        {/* Push notifications */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Notificaciones Push</h4>
            <p className="text-xs text-muted-foreground">
              Recibir notificaciones aunque la app este cerrada
            </p>
          </div>

          {!isSupported ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <BellOff className="size-4" />
              Tu navegador no soporta notificaciones push
            </p>
          ) : permission === "denied" ? (
            <p className="text-sm text-destructive flex items-center gap-2">
              <BellOff className="size-4" />
              Las notificaciones push fueron bloqueadas. Activalas desde la
              configuracion del navegador.
            </p>
          ) : isSubscribed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="size-4 text-green-500" />
                <span>
                  Push activado
                  {subscriptionCount > 1
                    ? ` (${subscriptionCount} dispositivos)`
                    : ""}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={unsubscribe}>
                Desactivar push
              </Button>
            </div>
          ) : (
            <Button
              onClick={subscribe}
              disabled={!notificationsEnabled}
              size="sm"
            >
              <Bell className="size-4 mr-2" />
              Activar notificaciones push
            </Button>
          )}
        </div>

        {notificationsEnabled && (
          <>
            <Separator />

            {/* Per-type toggles */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Tipos de notificacion</h4>
              <p className="text-xs text-muted-foreground">
                Estas notificaciones se envian tanto in-app como push (si esta
                activado)
              </p>

              <div className="space-y-3">
                {availableTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.key}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`size-4 ${type.color} shrink-0`} />
                        <div>
                          <p className="text-sm font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                      <div className="size-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="size-2 rounded-full bg-green-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Las notificaciones se envian segun los modulos que tengas
                activos. Para desactivar un tipo, desactiva el modulo
                correspondiente.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
