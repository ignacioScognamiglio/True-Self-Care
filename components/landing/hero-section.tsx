"use client";

import Link from "next/link";
import {
  Sparkles,
  Apple,
  Dumbbell,
  Brain,
  Moon,
  Droplets,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatDemo } from "./chat-demo";

const moduleIcons = [
  { icon: Sparkles, label: "Skincare", color: "text-wellness-skincare" },
  { icon: Apple, label: "Nutricion", color: "text-wellness-nutrition" },
  { icon: Dumbbell, label: "Fitness", color: "text-wellness-fitness" },
  { icon: Brain, label: "Salud Mental", color: "text-wellness-mental" },
  { icon: Moon, label: "Sueno", color: "text-wellness-sleep" },
  { icon: Droplets, label: "Hidratacion", color: "text-wellness-hydration" },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left — Text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={fadeUp}>
              <Badge
                variant="outline"
                className="border-primary/30 text-primary"
              >
                Impulsado por IA
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight lg:text-5xl"
            >
              Tu bienestar, conectado por IA
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-lg"
            >
              Skincare, nutricion, fitness, salud mental, sueno y habitos —
              todos conectados por agentes de IA que entienden como se
              relacionan.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/sign-up">Empezar gratis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .querySelector("#how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Ver como funciona
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-3 pt-2">
              {moduleIcons.map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="group relative flex size-10 items-center justify-center rounded-lg bg-muted/60 transition-colors hover:bg-muted"
                >
                  <Icon className={`size-5 ${color}`} />
                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow opacity-0 transition-opacity group-hover:opacity-100">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Chat demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center lg:justify-end"
          >
            <ChatDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
