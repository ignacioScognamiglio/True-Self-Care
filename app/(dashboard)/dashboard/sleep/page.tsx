"use client";

import { useState } from "react";
import { SleepLogForm } from "@/components/wellness/sleep/sleep-log-form";
import { SleepStats } from "@/components/wellness/sleep/sleep-stats";
import { SleepChart } from "@/components/wellness/sleep/sleep-chart";
import { SleepHistory } from "@/components/wellness/sleep/sleep-history";
import { SleepRoutineView } from "@/components/wellness/sleep/sleep-routine-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function SleepPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sueno</h2>
          <p className="text-muted-foreground">
            Registro y seguimiento de tu descanso
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4 mr-1" />
          Registrar sueno
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar sueno</DialogTitle>
            <DialogDescription>
              Registra las horas y calidad de tu descanso
            </DialogDescription>
          </DialogHeader>
          <SleepLogForm
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <SleepStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <SleepChart />
        <SleepRoutineView />
      </div>

      <SleepHistory />
    </div>
  );
}
