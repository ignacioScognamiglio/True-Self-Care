"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { SleepLogForm } from "@/components/wellness/sleep/sleep-log-form";
import { SleepStats } from "@/components/wellness/sleep/sleep-stats";
import { SleepHistory } from "@/components/wellness/sleep/sleep-history";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ChartSkeleton } from "@/components/ui/loading-skeletons";

const SleepChart = dynamic(
  () =>
    import("@/components/wellness/sleep/sleep-chart").then((mod) => ({
      default: mod.SleepChart,
    })),
  { loading: () => <ChartSkeleton /> }
);

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

      <SleepChart />

      <SleepHistory />
    </div>
  );
}
