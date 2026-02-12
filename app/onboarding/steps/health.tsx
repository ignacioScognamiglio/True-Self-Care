"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HealthStepProps {
  modules: string[];
  onNext: (data: HealthData) => void;
  onBack: () => void;
}

export interface HealthData {
  dietaryRestrictions?: string[];
  allergies?: string[];
  fitnessLevel?: string;
  healthGoals?: string[];
  sleepBedTime?: string;
  sleepWakeTime?: string;
}

const dietOptions = [
  "Vegetariano",
  "Vegano",
  "Sin gluten",
  "Sin lactosa",
  "Keto",
  "Ninguna",
];

const goalOptions = [
  "Beber mas agua",
  "Ejercicio regular",
  "Mejor sueno",
  "Meditacion",
  "Alimentacion saludable",
];

export function HealthStep({ modules, onNext, onBack }: HealthStepProps) {
  const [dietRestrictions, setDietRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [sleepBedTime, setSleepBedTime] = useState("");
  const [sleepWakeTime, setSleepWakeTime] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    const data: HealthData = {};
    if (dietRestrictions.length > 0 && !dietRestrictions.includes("Ninguna"))
      data.dietaryRestrictions = dietRestrictions;
    if (allergies.trim())
      data.allergies = allergies.split(",").map((a) => a.trim()).filter(Boolean);
    if (fitnessLevel) data.fitnessLevel = fitnessLevel;
    if (goals.length > 0) data.healthGoals = goals;
    if (sleepBedTime) data.sleepBedTime = sleepBedTime;
    if (sleepWakeTime) data.sleepWakeTime = sleepWakeTime;
    onNext(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md space-y-6 max-h-[70vh] overflow-y-auto pr-1"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Cuestionario de bienestar</h2>
        <p className="text-muted-foreground">
          Responde segun los modulos que elegiste. Todo es opcional.
        </p>
      </div>

      <div className="space-y-6">
        {/* Nutrition */}
        {modules.includes("nutrition") && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-wellness-nutrition">
              Nutricion
            </h3>
            <div className="space-y-2">
              <Label>Restricciones alimentarias</Label>
              <div className="flex flex-wrap gap-2">
                {dietOptions.map((diet) => (
                  <Badge
                    key={diet}
                    variant={
                      dietRestrictions.includes(diet) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleItem(dietRestrictions, setDietRestrictions, diet)
                    }
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">
                Alergias (separadas por comas)
              </Label>
              <Input
                id="allergies"
                placeholder="Ej: mani, mariscos"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Fitness */}
        {modules.includes("fitness") && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-wellness-fitness">
              Fitness
            </h3>
            <div className="space-y-2">
              <Label>Nivel de fitness</Label>
              <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Sleep */}
        {modules.includes("sleep") && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-wellness-sleep">
              Sueno
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bedtime">Hora de dormir</Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={sleepBedTime}
                  onChange={(e) => setSleepBedTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waketime">Hora de despertar</Label>
                <Input
                  id="waketime"
                  type="time"
                  value={sleepWakeTime}
                  onChange={(e) => setSleepWakeTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Habits */}
        {modules.includes("habits") && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-wellness-hydration">
              Habitos
            </h3>
            <div className="space-y-2">
              <Label>Objetivos principales</Label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <Badge
                    key={goal}
                    variant={goals.includes(goal) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleItem(goals, setGoals, goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atras
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continuar
        </Button>
      </div>
    </motion.div>
  );
}
