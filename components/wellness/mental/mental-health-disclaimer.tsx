"use client";

import { Info } from "lucide-react";

export function MentalHealthDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <Info className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm text-amber-800 dark:text-amber-200">
        <p className="font-medium">Herramienta de bienestar emocional con IA</p>
        <p className="mt-1">
          Este modulo no sustituye la terapia ni el consejo de un profesional de
          salud mental. Si estas en crisis, contacta la{" "}
          <strong>Linea 988</strong> (llamar o texto), <strong>Crisis Text Line</strong>{" "}
          (envia HOME al 741741) o el <strong>Telefono de la Esperanza</strong>: 717 003 717.
        </p>
      </div>
    </div>
  );
}
