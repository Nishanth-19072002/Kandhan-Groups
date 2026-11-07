"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

const buildingPaths = [
  // ground foundation line
  "M20 180 H380",
  // center rising tower
  "M150 180 V40 H250 V180",
  "M150 70 H250 M150 100 H250 M150 130 H250 M150 160 H250",
  "M183 40 V180 M217 40 V180",
  // left industrial wing
  "M70 180 V100 H150",
  "M70 130 H150 M70 160 H150 M110 100 V180",
  // right wing
  "M250 85 H330 V180",
  "M250 120 H330 M250 155 H330 M290 85 V180",
  // crane hoisting at top
  "M290 85 V15 M230 22 H360 M290 15 L230 22 M290 15 L360 22 M342 22 V50",
];

export default function IntroLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    const total = 3200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setOpen(true), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      document.documentElement.style.overflow = "";
      onDone();
    }, 1200);
    return () => clearTimeout(t);
  }, [open, onDone]);

  const skip = () => setOpen(true);

  return (
    <AnimatePresence>
      <motion.div key="loader" className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden">
        {/* ────────── 2-WAY SPLIT GATES ────────── */}
        {/* Left Gate (Slides left -100%) */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-ink bp-grid border-r border-gold/40 shadow-2xl z-20"
          animate={open ? { x: "-100%" } : { x: 0 }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Subtle architectural vertical beam texture */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-gold/30 to-transparent" />
        </motion.div>

        {/* Right Gate (Slides right +100%) */}
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 bg-ink bp-grid border-l border-gold/40 shadow-2xl z-20"
          animate={open ? { x: "100%" } : { x: 0 }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-gold/30 to-transparent" />
        </motion.div>

        {/* ────────── CINEMATIC SUNRISE & RISING LOGO + CONSTRUCTION ────────── */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
          animate={open ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.55 }}
        >
          {/* Golden Sunrise Glow aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.4, 0.85, 0.6], scale: [0.8, 1.25, 1.1] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror" }}
            className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,165,36,0.35)_0%,rgba(217,119,6,0.2)_40%,transparent_70%)] blur-[80px]"
          />

          {/* 1. THE LOGO RISING LIKE THE SUN TO THE TOP */}
          <motion.div
            initial={{ y: 90, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Sunrise halo ring behind logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.35, opacity: 0.85 }}
              transition={{ delay: 0.4, duration: 1.4 }}
              className="absolute -inset-6 rounded-full bg-gradient-to-t from-gold/30 via-gold-2/20 to-transparent blur-xl"
            />

            {/* Official Kandhan Groups Emblem */}
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-3xl border-2 border-gold/70 shadow-[0_0_50px_rgba(245,165,36,0.7)] ring-4 ring-ink/80">
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Brand Title with Golden Sunrise Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-4 text-center"
            >
              <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-[0.28em] text-white">
                KANDHAN <span className="text-gradient-gold">GROUPS</span>
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.45em] text-cyan-bp/90">
                Civil Works · Industrial Plants · PMC
              </div>
            </motion.div>
          </motion.div>

          {/* 2. CONSTRUCTION / BUILDING BLUEPRINT RISING BENEATH THE LOGO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.2 }}
            className="relative mt-2 w-[min(460px,85vw)]"
          >
            <svg viewBox="0 0 400 190" className="w-full">
              {buildingPaths.map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={i < 1 ? "#38bdf8" : "#f5a524"}
                  strokeWidth={i === 1 ? 2.2 : 1.3}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.9 + 0.08 * i, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 5px rgba(245,165,36,.5))" }}
                />
              ))}
              {/* Construction window glow lights */}
              {[...Array(12)].map((_, i) => (
                <motion.rect
                  key={`w${i}`}
                  x={158 + (i % 3) * 31}
                  y={48 + Math.floor(i / 3) * 30}
                  width={20}
                  height={16}
                  fill="#ffcf6b"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0.4] }}
                  transition={{ delay: 1.5 + i * 0.06, duration: 0.5 }}
                />
              ))}
            </svg>
          </motion.div>

          {/* 3. PROGRESS BAR & SKIP BUTTON */}
          <div className="mt-4 w-[min(320px,70vw)]">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-bp via-gold to-gold-2 shadow-[0_0_12px_#f5a524]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
              <span className="tracking-widest">SUNRISE // UNVEILING</span>
              <span className="text-gold-2 font-bold">{progress}%</span>
            </div>
          </div>

          <button
            onClick={skip}
            suppressHydrationWarning
            className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.25em] text-slate-400 transition hover:text-gold"
          >
            Enter Site →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
