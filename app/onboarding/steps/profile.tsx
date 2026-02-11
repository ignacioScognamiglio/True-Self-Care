"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileStepProps {
  onNext: (data: ProfileData) => void;
  onBack: () => void;
}

export interface ProfileData {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
}

export function ProfileStep({ onNext, onBack }: ProfileStepProps) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = () => {
    const data: ProfileData = {};
    if (age) data.age = parseInt(age);
    if (gender) data.gender = gender;
    if (height) data.height = parseFloat(height);
    if (weight) data.weight = parseFloat(weight);
    onNext(data);
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Datos basicos</h2>
        <p className="text-muted-foreground">
          Opcional — ayuda a personalizar mejor tus recomendaciones.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            placeholder="25"
            min={13}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Genero</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
              <SelectItem value="non-binary">No binario</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefiero no decir
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              min={100}
              max={250}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              min={30}
              max={300}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atras
        </Button>
        <Button variant="ghost" onClick={handleSkip}>
          Saltar
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continuar
        </Button>
      </div>
    </motion.div>
  );
}
