"use client";

import {
  ClipboardCheck,
  Sparkles,
  Lightbulb,
  Moon,
  Brain,
  Dumbbell,
  Apple,
  Droplets,
} from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    num: "01",
    icon: ClipboardCheck,
    title: "Registra tu dia",
    description:
      "Registra estado de animo, comidas, ejercicio, sueno y habitos. Solo toma unos minutos.",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "La IA conecta los puntos",
    description:
      "Nuestros agentes analizan patrones entre modulos: como tu sueno afecta tu animo, como el estres afecta tu nutricion.",
  },
  {
    num: "03",
    icon: Lightbulb,
    title: "Recibe insights personalizados",
    description:
      "Obtenes recomendaciones que consideran todo tu bienestar, no solo una dimension aislada.",
  },
];

const moduleIcons = [
  { icon: Apple, color: "text-wellness-nutrition" },
  { icon: Dumbbell, color: "text-wellness-fitness" },
  { icon: Brain, color: "text-wellness-mental" },
  { icon: Moon, color: "text-wellness-sleep" },
  { icon: Droplets, color: "text-wellness-hydration" },
];

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export function HowItWorksSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="py-20 md:py-28 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Como funciona
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            IA que conecta todo tu bienestar
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No es solo tracking — nuestros agentes de IA descubren patrones
            que tu no puedes ver.
          </p>
        </div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.2 }}
          className="grid gap-8 md:grid-cols-3 relative"
        >
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-px bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={stepVariants}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col items-center text-center space-y-4"
            >
              {/* Number */}
              <span className="text-5xl font-bold text-primary/15">
                {step.num}
              </span>

              {/* Icon circle */}
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 relative z-10">
                <step.icon className="size-6 text-primary" />
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {step.description}
              </p>

              {/* Step-specific animation */}
              {i === 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ staggerChildren: 0.15, delayChildren: 0.5 }}
                  className="flex gap-2 pt-2"
                >
                  {moduleIcons.map(({ icon: Icon, color }, j) => (
                    <motion.div
                      key={j}
                      variants={{
                        hidden: { opacity: 0, scale: 0 },
                        show: { opacity: 1, scale: 1 },
                      }}
                      className="flex size-8 items-center justify-center rounded-lg bg-muted"
                    >
                      <Icon className={`size-4 ${color}`} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {i === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex gap-1.5 pt-2"
                >
                  {[
                    "bg-wellness-sleep",
                    "bg-wellness-nutrition",
                    "bg-wellness-mental",
                  ].map((color, j) => (
                    <motion.div
                      key={j}
                      initial={{ width: 0 }}
                      whileInView={{ width: 40 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1 + j * 0.2, duration: 0.4 }}
                      className={`h-1 rounded-full ${color}`}
                    />
                  ))}
                </motion.div>
              )}

              {i === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="rounded-lg border bg-card p-3 text-left text-xs text-muted-foreground max-w-[240px] shadow-sm"
                >
                  <p>
                    &quot;Tu ansiedad correlaciona con las ultimas 3 noches de mal
                    sueno. Prioriza dormir 8h esta semana.&quot;
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
