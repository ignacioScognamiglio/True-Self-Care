"use client";

import {
  Sparkles,
  Apple,
  Dumbbell,
  Brain,
  Moon,
  Droplets,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  SkincareAnimation,
  NutritionAnimation,
  FitnessAnimation,
  MentalAnimation,
  SleepAnimation,
  HabitsAnimation,
} from "./feature-animations";

const features = [
  {
    icon: Sparkles,
    color: "text-wellness-skincare",
    bg: "bg-wellness-skincare/15",
    title: "Skincare",
    description:
      "Analisis de piel con IA, tracking de rutinas y correlacion con sueno y estres.",
    Animation: SkincareAnimation,
  },
  {
    icon: Apple,
    color: "text-wellness-nutrition",
    bg: "bg-wellness-nutrition/15",
    title: "Nutricion",
    description:
      "Registro de comidas, analisis de fotos con IA y planes de alimentacion personalizados.",
    Animation: NutritionAnimation,
  },
  {
    icon: Dumbbell,
    color: "text-wellness-fitness",
    bg: "bg-wellness-fitness/15",
    title: "Fitness",
    description:
      "Planes de entrenamiento adaptativos, tracking de ejercicios y progresion inteligente.",
    Animation: FitnessAnimation,
  },
  {
    icon: Brain,
    color: "text-wellness-mental",
    bg: "bg-wellness-mental/15",
    title: "Salud Mental",
    description:
      "Check-ins de estado de animo, diario con IA, ejercicios de bienestar emocional.",
    Animation: MentalAnimation,
  },
  {
    icon: Moon,
    color: "text-wellness-sleep",
    bg: "bg-wellness-sleep/15",
    title: "Sueno",
    description:
      "Registro de sueno, analisis de patrones y rutinas para dormir mejor.",
    Animation: SleepAnimation,
  },
  {
    icon: Droplets,
    color: "text-wellness-hydration",
    bg: "bg-wellness-hydration/15",
    title: "Habitos",
    description:
      "Seguimiento de habitos diarios, rachas, recordatorios e hidratacion.",
    Animation: HabitsAnimation,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Modulos
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Seis pilares de bienestar, un solo lugar
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Activa solo los que necesitas. Cada modulo tiene un agente de IA
            especializado.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="h-full overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {/* Icon */}
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${feature.bg}`}
                  >
                    <feature.icon className={`size-5 ${feature.color}`} />
                  </div>
                  {/* Text */}
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  {/* Animation */}
                  <div className="relative">
                    <feature.Animation />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
