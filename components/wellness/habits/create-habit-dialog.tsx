"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["General", "Salud", "Fitness", "Mental", "Cuidado personal"] as const;
const FREQUENCIES = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
] as const;

const habitSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50, "Maximo 50 caracteres"),
  category: z.string(),
  frequency: z.enum(["daily", "weekly"]),
  targetPerPeriod: z.number().int().min(1, "Minimo 1").max(30, "Maximo 30"),
});

type FormData = z.infer<typeof habitSchema>;

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const createHabit = useMutation(api.functions.habits.createHabit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      category: "General",
      frequency: "daily",
      targetPerPeriod: 1,
    },
  });

  const category = watch("category");
  const frequency = watch("frequency");

  async function onSubmit(data: FormData) {
    await createHabit(data);
    toast.success("Habito creado");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="size-4" />
          Nuevo habito
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear habito</DialogTitle>
          <DialogDescription>
            Define un nuevo habito para hacer seguimiento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Nombre</Label>
            <Input
              id="habit-name"
              placeholder="Ej: Meditar 10 minutos"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(val) => setValue("category", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select
                value={frequency}
                onValueChange={(val) =>
                  setValue("frequency", val as "daily" | "weekly")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Meta por periodo</Label>
              <Input
                id="target"
                type="number"
                min={1}
                max={30}
                {...register("targetPerPeriod", { valueAsNumber: true })}
              />
              {errors.targetPerPeriod && (
                <p className="text-sm text-destructive">
                  {errors.targetPerPeriod.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear habito"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
