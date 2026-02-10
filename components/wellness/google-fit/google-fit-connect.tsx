"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Watch, RefreshCw, Unplug, CheckCircle, Moon, Footprints, Heart } from "lucide-react";

export function GoogleFitConnect() {
  const connection = useQuery(api.functions.googleFit.getGoogleFitConnection);
  const disconnectGoogleFit = useMutation(api.functions.googleFit.disconnectGoogleFit);
  const syncGoogleFit = useAction(api.functions.googleFit.syncGoogleFit);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  if (connection === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Watch className="size-5 text-blue-500" />
            Google Fit
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[80px] items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  const isConnected = connection?.connected ?? false;

  const handleConnect = () => {
    window.location.href = "/api/google-fit/connect";
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectGoogleFit();
      setSyncResult(null);
    } catch (error) {
      console.error("Error al desconectar Google Fit:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncGoogleFit();
      const sleepImported = (result as any)?.sleep?.imported ?? 0;
      const activityImported = (result as any)?.activity?.imported ?? 0;

      if (sleepImported === 0 && activityImported === 0) {
        setSyncResult("Sin datos nuevos para importar");
      } else {
        const parts = [];
        if (sleepImported > 0) parts.push(`${sleepImported} noche${sleepImported > 1 ? "s" : ""}`);
        if (activityImported > 0) parts.push(`${activityImported} actividad${activityImported > 1 ? "es" : ""}`);
        setSyncResult(`Importado: ${parts.join(", ")}`);
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      setSyncResult("Error al sincronizar. Intentalo de nuevo.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Watch className="size-5 text-blue-500" />
            Google Fit
          </CardTitle>
          <CardDescription>
            Conecta tu cuenta de Google Fit para importar datos de sueno, pasos
            y frecuencia cardiaca automaticamente desde tu wearable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Moon className="size-3" />
                Sueno
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Footprints className="size-3" />
                Pasos
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Heart className="size-3" />
                Frecuencia cardiaca
              </Badge>
            </div>
            <Button onClick={handleConnect} className="w-full sm:w-auto">
              <Watch className="size-4 mr-2" />
              Conectar Google Fit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedDate = connection?.connectedAt
    ? new Date(connection.connectedAt).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Watch className="size-5 text-blue-500" />
            Google Fit
          </CardTitle>
          <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-600">
            <CheckCircle className="size-3" />
            Conectado
          </Badge>
        </div>
        {connectedDate && (
          <CardDescription>
            Conectado desde {connectedDate}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Moon className="size-3" />
              Sueno
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Footprints className="size-3" />
              Pasos
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Heart className="size-3" />
              Frecuencia cardiaca
            </Badge>
          </div>

          {syncResult && (
            <p className="text-sm text-muted-foreground">{syncResult}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`size-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar ahora"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-destructive hover:text-destructive"
            >
              <Unplug className="size-4 mr-2" />
              {isDisconnecting ? "Desconectando..." : "Desconectar"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Los datos se sincronizan automaticamente cada 6 horas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
