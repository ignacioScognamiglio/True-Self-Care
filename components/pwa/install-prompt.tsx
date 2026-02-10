"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pwa-install-dismissed")) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt || dismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md shadow-lg">
      <CardContent className="flex items-center gap-3 p-4">
        <Download className="size-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-medium">Instala True Self-Care</p>
          <p className="text-xs text-muted-foreground">
            Acceso rapido desde tu pantalla de inicio
          </p>
        </div>
        <Button size="sm" onClick={handleInstall} aria-label="Instalar aplicacion">
          Instalar
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDismiss} aria-label="Cerrar banner de instalacion">
          <X className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
