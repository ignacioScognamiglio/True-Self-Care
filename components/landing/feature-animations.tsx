"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Zap, Check } from "lucide-react";

// ═══ Skincare: Face silhouette with pulsing points ═══
export function SkincareAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const points = [
    { cx: 64, cy: 30, label: "Frente" },
    { cx: 45, cy: 55, label: "Mejilla" },
    { cx: 83, cy: 55, label: "Mejilla" },
    { cx: 64, cy: 75, label: "Menton" },
  ];

  return (
    <div ref={ref} className="flex items-center justify-center h-32">
      <svg viewBox="0 0 128 100" className="w-32 h-24">
        {/* Face outline */}
        <ellipse
          cx="64"
          cy="52"
          rx="30"
          ry="38"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-wellness-skincare/30"
        />
        {/* Scan points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r="4"
            className="fill-wellness-skincare"
            initial={{ opacity: 0, scale: 0 }}
            animate={
              inView
                ? {
                    opacity: [0, 1, 0.6, 1],
                    scale: [0, 1.3, 1, 1],
                  }
                : {}
            }
            transition={{
              delay: i * 0.3,
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// ═══ Nutrition: Donut chart with calorie counter ═══
export function NutritionAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const target = 1850;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  const r = 32;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { pct: 0.3, color: "stroke-green-500" },
    { pct: 0.45, color: "stroke-yellow-500" },
    { pct: 0.25, color: "stroke-orange-500" },
  ];

  let offset = 0;

  return (
    <div ref={ref} className="flex items-center justify-center h-32">
      <div className="relative">
        <svg viewBox="0 0 80 80" className="w-24 h-24">
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted"
          />
          {segments.map((seg, i) => {
            const dashLen = circumference * seg.pct;
            const dashOffset = circumference - offset * circumference;
            offset += seg.pct;
            return (
              <motion.circle
                key={i}
                cx="40"
                cy="40"
                r={r}
                fill="none"
                strokeWidth="6"
                className={seg.color}
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.3, duration: 0.5 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none">
            {count.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">kcal</span>
        </div>
      </div>
    </div>
  );
}

// ═══ Fitness: Progress bar with XP counter ═══
export function FitnessAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const target = 180;
    const duration = 1000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setXp(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center h-32 gap-3 px-4">
      <div className="flex items-center gap-2 text-sm">
        <Zap className="size-4 text-wellness-fitness" />
        <span className="font-medium">XP de workout</span>
        <span className="ml-auto font-bold text-wellness-fitness">{xp}</span>
      </div>
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-wellness-fitness"
          initial={{ width: "0%" }}
          animate={inView ? { width: "75%" } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">75% del objetivo diario</p>
    </div>
  );
}

// ═══ Mental: Mood selector sliding from sad to happy ═══
export function MentalAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [selected, setSelected] = useState(0);
  const moods = ["😔", "😐", "🙂", "😊", "😄"];

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setSelected((s) => (s < moods.length - 1 ? s + 1 : 0));
    }, 800);
    return () => clearInterval(interval);
  }, [inView, moods.length]);

  return (
    <div ref={ref} className="flex items-center justify-center h-32">
      <div className="flex gap-3">
        {moods.map((mood, i) => (
          <motion.div
            key={i}
            animate={{
              scale: selected === i ? 1.3 : 1,
              opacity: selected === i ? 1 : 0.4,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-2xl cursor-default"
          >
            {mood}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══ Sleep: Bar chart for week ═══
export function SleepAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const days = [
    { label: "L", hours: 7 },
    { label: "M", hours: 6 },
    { label: "X", hours: 8 },
    { label: "J", hours: 5.5 },
    { label: "V", hours: 7.5 },
    { label: "S", hours: 9 },
    { label: "D", hours: 8 },
  ];

  const maxH = 10;

  return (
    <div ref={ref} className="flex items-end justify-center h-32 gap-1.5 px-4 pb-4">
      {days.map((d, i) => {
        const pct = (d.hours / maxH) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              className="w-full rounded-t bg-wellness-sleep"
              style={{ minWidth: 12 }}
              initial={{ height: 0 }}
              animate={inView ? { height: `${pct}%` } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
      {/* Goal line */}
      <div
        className="absolute left-4 right-4 border-t border-dashed border-wellness-sleep/40"
        style={{ bottom: `${(8 / maxH) * 100 * 0.7 + 16}px` }}
      />
    </div>
  );
}

// ═══ Habits: Checkboxes with streak counter ═══
export function HabitsAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setChecked((c) => (c < 7 ? c + 1 : 0));
    }, 500);
    return () => clearInterval(interval);
  }, [inView]);

  const days = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div ref={ref} className="flex flex-col items-center justify-center h-32 gap-3">
      <div className="flex gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`flex size-7 items-center justify-center rounded border-2 transition-colors duration-200 ${
                i < checked
                  ? "border-wellness-hydration bg-wellness-hydration/20"
                  : "border-muted"
              }`}
            >
              {i < checked && (
                <Check className="size-3.5 text-wellness-hydration" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Racha:</span>
        <span className="font-bold text-wellness-hydration">{checked} dias</span>
      </div>
    </div>
  );
}
