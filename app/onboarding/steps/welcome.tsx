"use client";

import { Leaf } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md text-center space-y-6"
    >
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Leaf className="size-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bienvenido a {APP_NAME}</h1>
        <p className="text-muted-foreground">
          Vamos a configurar tu perfil de bienestar personalizado. Solo toma
          unos minutos.
        </p>
      </div>

      <Button size="lg" onClick={onNext} className="w-full sm:w-auto">
        Comenzar
      </Button>
    </motion.div>
  );
}
