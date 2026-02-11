"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Maria G.",
    role: "Usuaria desde enero 2026",
    quote:
      "Por fin una app que entiende que mi acne y mi estres estan conectados. Las recomendaciones de sueno mejoraron mi piel en 2 semanas.",
    initials: "MG",
  },
  {
    name: "Carlos R.",
    role: "Entusiasta del fitness",
    quote:
      "Me encanta que ajusta mis planes de entrenamiento segun como dormi. Nunca habia tenido tanta consistencia en el gym.",
    initials: "CR",
  },
  {
    name: "Ana L.",
    role: "Profesional ocupada",
    quote:
      "El check-in diario me toma 2 minutos y la IA me da insights que ningun otra app me habia dado. Es como tener un coach personal.",
    initials: "AL",
  },
  {
    name: "Diego M.",
    role: "Estudiante universitario",
    quote:
      "La gamificacion me mantiene motivado. Las rachas y los logros hacen que cuidarme sea casi adictivo. Llevo 45 dias seguidos.",
    initials: "DM",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function TestimonialsSection({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Testimonios
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
        </div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.12 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={cardVariants}>
              <Card className="h-full">
                <CardContent className="p-6 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &quot;{t.quote}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
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
