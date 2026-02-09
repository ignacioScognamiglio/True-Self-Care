"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { toast } from "sonner";

export function TodayLog() {
  const entries = useQuery(api.functions.wellness.getTodayWaterEntries);
  const deleteEntry = useMutation(api.functions.wellness.deleteWaterEntry);

  if (!entries) {
    return (
      <div className="text-sm text-muted-foreground">Cargando...</div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">Sin registros hoy</div>
    );
  }

  async function handleDelete(entryId: Id<"wellnessEntries">) {
    await deleteEntry({ entryId });
    toast.success("Registro eliminado");
  }

  return (
    <ScrollArea className="max-h-[200px]">
      <div className="space-y-2">
        {entries.map((entry) => {
          const time = new Date(entry.timestamp).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const amount = entry.data?.amount ?? 0;

          return (
            <div
              key={entry._id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{time}</span>
                <span className="font-medium">{amount}ml</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => handleDelete(entry._id)}
              >
                <X className="size-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
