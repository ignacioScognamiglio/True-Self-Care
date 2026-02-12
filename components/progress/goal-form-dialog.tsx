"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { value: "fitness", label: "Fitness" },
  { value: "nutrition", label: "Nutricion" },
  { value: "sleep", label: "Sueno" },
  { value: "mental", label: "Salud Mental" },
  { value: "habits", label: "Habitos" },
  { value: "weight", label: "Peso" },
  { value: "general", label: "General" },
];

export function GoalFormDialog({ open, onOpenChange }: GoalFormDialogProps) {
  const createGoal = useMutation(api.functions.goals.createGoal);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("El titulo es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const target = parseFloat(targetValue);
      await createGoal({
        category,
        title: title.trim(),
        targetValue: isNaN(target) ? undefined : target,
        unit: unit.trim() || undefined,
        deadline: deadline
          ? new Date(deadline).getTime()
          : undefined,
      });
      toast.success("Meta creada");
      onOpenChange(false);
      // Reset
      setCategory("general");
      setTitle("");
      setTargetValue("");
      setUnit("");
      setDeadline("");
    } catch {
      toast.error("Error al crear la meta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva meta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-title">Titulo</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Correr 100km este mes"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Valor objetivo</Label>
              <Input
                id="goal-target"
                type="number"
                min={0}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-unit">Unidad</Label>
              <Input
                id="goal-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="km, kg, dias..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-deadline">Fecha limite (opcional)</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Crear meta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
