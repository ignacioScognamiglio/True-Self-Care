"use client";

import { useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import { GlassWater, Coffee, CupSoda, Plus } from "lucide-react";
import { toast } from "sonner";

const QUICK_OPTIONS = [
  { amount: 150, label: "150ml", icon: GlassWater },
  { amount: 250, label: "250ml", icon: Coffee },
  { amount: 500, label: "500ml", icon: CupSoda },
] as const;

export function QuickAddButtons() {
  const logWater = useMutation(api.functions.wellness.logWaterEntryPublic);
  const [customAmount, setCustomAmount] = useState(250);
  const [open, setOpen] = useState(false);

  async function handleQuickAdd(amount: number) {
    await logWater({ amount });
    toast.success(`${amount}ml registrados`);
  }

  async function handleCustomAdd() {
    await logWater({ amount: customAmount });
    toast.success(`${customAmount}ml registrados`);
    setOpen(false);
  }

  return (
    <div className="flex gap-2">
      {QUICK_OPTIONS.map(({ amount, label, icon: Icon }) => (
        <Button
          key={amount}
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => handleQuickAdd(amount)}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 gap-1">
            <Plus className="size-4" />
            Custom
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cantidad personalizada</DialogTitle>
            <DialogDescription>
              Selecciona la cantidad de agua en mililitros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center text-2xl font-bold">
              {customAmount}ml
            </div>
            <Slider
              value={[customAmount]}
              onValueChange={(value) => setCustomAmount(value[0])}
              min={100}
              max={1000}
              step={50}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100ml</span>
              <span>1000ml</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCustomAdd}>
              Registrar {customAmount}ml
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
