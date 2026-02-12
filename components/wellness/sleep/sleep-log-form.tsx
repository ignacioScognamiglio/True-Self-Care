"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMemo } from "react";

const QUALITY_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Mal",
  3: "Regular",
  4: "Bien",
  5: "Excelente",
};

const QUALITY_EMOJIS: Record<number, string> = {
  1: "\uD83D\uDE2B",
  2: "\uD83D\uDE1E",
  3: "\uD83D\uDE10",
  4: "\uD83D\uDE0A",
  5: "\uD83D\uDE34",
};

const SLEEP_FACTORS = [
  { value: "estres", label: "Estres" },
  { value: "cafeina", label: "Cafeina" },
  { value: "alcohol", label: "Alcohol" },
  { value: "pantallas", label: "Pantallas" },
  { value: "comida_pesada", label: "Comida pesada" },
  { value: "ruido", label: "Ruido" },
  { value: "meditacion", label: "Meditacion" },
  { value: "lectura", label: "Lectura" },
] as const;

const sleepSchema = z.object({
  bedTime: z.string().min(1, "La hora de acostarse es obligatoria"),
  wakeTime: z.string().min(1, "La hora de despertar es obligatoria"),
  quality: z.number().min(1).max(5),
  factors: z.array(z.string()),
});

type FormData = z.infer<typeof sleepSchema>;

interface SleepLogFormProps {
  defaultValues?: Partial<FormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function calculateDuration(bedTime: string, wakeTime: string): string {
  if (!bedTime || !wakeTime) return "--";
  const [bedH, bedM] = bedTime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);

  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  const totalMinutes = wakeMinutes - bedMinutes;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function SleepLogForm({
  defaultValues,
  onSuccess,
  onCancel,
}: SleepLogFormProps) {
  const logSleep = useMutation(api.functions.sleep.logSleepEntryPublic);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      bedTime: "",
      wakeTime: "",
      quality: 3,
      factors: [],
      ...defaultValues,
    },
  });

  const bedTime = watch("bedTime");
  const wakeTime = watch("wakeTime");
  const quality = watch("quality");
  const factors = watch("factors");

  const duration = useMemo(
    () => calculateDuration(bedTime, wakeTime),
    [bedTime, wakeTime]
  );

  function toggleFactor(factor: string) {
    const current = factors ?? [];
    if (current.includes(factor)) {
      setValue(
        "factors",
        current.filter((f) => f !== factor)
      );
    } else {
      setValue("factors", [...current, factor]);
    }
  }

  async function onSubmit(data: FormData) {
    await logSleep({
      sleep: {
        bedTime: data.bedTime,
        wakeTime: data.wakeTime,
        quality: data.quality,
        factors: data.factors.length > 0 ? data.factors : undefined,
      },
    });
    toast.success("Sueno registrado");
    reset();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bed-time">Hora de acostarse</Label>
          <Input id="bed-time" type="time" aria-required="true" {...register("bedTime")} />
          {errors.bedTime && (
            <p className="text-sm text-destructive">
              {errors.bedTime.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="wake-time">Hora de despertar</Label>
          <Input id="wake-time" type="time" aria-required="true" {...register("wakeTime")} />
          {errors.wakeTime && (
            <p className="text-sm text-destructive">
              {errors.wakeTime.message}
            </p>
          )}
        </div>
      </div>

      {bedTime && wakeTime && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm text-center">
          Duracion estimada: <span className="font-semibold">{duration}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label>
          Calidad del sueno: {QUALITY_EMOJIS[quality]} {QUALITY_LABELS[quality]}
        </Label>
        <Slider
          min={1}
          max={5}
          step={1}
          value={[quality]}
          onValueChange={(val) => setValue("quality", val[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Terrible</span>
          <span>Excelente</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Factores</Label>
        <div className="flex flex-wrap gap-2">
          {SLEEP_FACTORS.map((f) => (
            <Badge
              key={f.value}
              variant={factors?.includes(f.value) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggleFactor(f.value)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar sueno"}
        </Button>
      </div>
    </form>
  );
}
