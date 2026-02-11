"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DataExport() {
  const [exporting, setExporting] = useState(false);
  const data = useQuery(
    api.functions.dataExport.exportUserData,
    exporting ? {} : "skip"
  );

  const handleExport = () => {
    setExporting(true);
  };

  // When data arrives, trigger download
  if (data && exporting) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `true-self-care-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    toast.success("Datos exportados correctamente");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar datos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Descarga una copia de todos tus datos en formato JSON. Incluye perfil,
          entradas, habitos, metas, fotos, planes y mas.
        </p>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          className="gap-2"
        >
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Descargar mis datos
        </Button>
      </CardContent>
    </Card>
  );
}
