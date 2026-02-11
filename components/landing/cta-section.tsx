"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl px-4 text-center space-y-6"
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Empieza a cuidarte de verdad
        </h2>
        <p className="text-lg text-muted-foreground">
          Gratis. Sin tarjeta. Tu bienestar te esta esperando.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button size="lg" asChild>
            <Link href="/sign-up">Crear mi cuenta</Link>
          </Button>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ya tienes cuenta? Inicia sesion
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
