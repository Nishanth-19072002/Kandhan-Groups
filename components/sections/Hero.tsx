"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuideCharacter, { type GuidePose } from "@/components/guide/GuideCharacter";
import WireframeTower from "@/components/three/WireframeTower";
import Typewriter from "@/components/ui/Typewriter";
import Icon from "@/components/ui/Icon";
import { openEnquiry } from "@/components/ui/brand";
import { scrollToId } from "@/components/SmoothScroll";
import { siteConfig } from "@/lib/siteConfig";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ started }: { started: boolean }) {
  const [pose, setPose] = useState<GuidePose>("walk");
  const [arrived, setArrived] = useState(false);
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    if (!started) return;
    const t1 = setTimeout(() => {
      setArrived(true);
      setPose("wave");
      setTalking(true);
    }, 2600);
    return () => clearTimeout(t1);
  }, [started]);

  const onSpeechDone = () => {
    setTimeout(() => setPose("point"), 200);
  };

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-28 lg:pt-24">
      {/* background */}
      <div className="absolute inset-0 bp-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-gold/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-bp/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-5 sm:px-8 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Civil Contracts · Turnkey Homes · Architecture · Trade Contracts · Smart Automation
          </motion.div>

          <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl xl:text-7xl">
            {["Building Tomorrow.", "Managing Everything."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className={`block ${i === 1 ? "text-gradient-gold" : ""}`}
                  initial={{ y: "110%" }}
                  animate={started ? { y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.15 + i * 0.15, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            From <span className="text-slate-200">company civil contracts</span> and <span className="text-slate-200">individual homes</span> to excavation, architectural planning, and smart home automation — {siteConfig.name} delivers everything from scratch to handover. You get one partner, one timeline, and one single bill.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.65, ease }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <button suppressHydrationWarning
              onClick={() => openEnquiry()}
              className="shine group flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-amber-deep px-7 py-3.5 font-semibold text-ink glow-gold transition hover:brightness-110"
            >
              Get a Free Quote
              <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" strokeWidth={2.2} />
            </button>
            <button suppressHydrationWarning
              onClick={() => scrollToId("services")}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:border-gold/50 hover:bg-white/10"
            >
              Explore Services
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-10 grid max-w-xl grid-cols-3 gap-3"
          >
            {[
              { icon: "user" as const, t: "One Point", s: "of Contact" },
              { icon: "layers" as const, t: "One Single", s: "Consolidated Bill" },
              { icon: "shield" as const, t: "End-to-End", s: "Accountability" },
            ].map((b) => (
              <div key={b.t} className="glass rounded-2xl p-3 sm:p-4">
                <Icon name={b.icon} className="h-5 w-5 text-gold" />
                <div className="mt-2 text-[13px] font-semibold leading-tight text-white sm:text-sm">{b.t}</div>
                <div className="text-[11px] text-slate-400 sm:text-xs">{b.s}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — 3D + guide */}
        <div className="relative h-[460px] sm:h-[540px] lg:h-[640px]">
          <div className="absolute inset-0">{started && <WireframeTower />}</div>

          {/* HUD corner labels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 }}
            className="pointer-events-none absolute right-2 top-6 hidden font-mono text-[10px] leading-relaxed text-cyan-bp/70 sm:block"
          >
            <div>SYS://KANDHAN.BUILD</div>
            <div>STATUS: <span className="text-gold">CONSTRUCTING</span></div>
            <div>MODE: BLUEPRINT → REALITY</div>
          </motion.div>

          {/* guide */}
          <motion.div
            className="absolute bottom-0 left-0 z-20 w-[160px] sm:w-[190px] lg:w-[220px]"
            initial={{ x: "260%" }}
            animate={started ? { x: "0%" } : {}}
            transition={{ duration: 2.6, ease: "linear" }}
            onAnimationComplete={() => started && !arrived && setArrived(true)}
          >
            <AnimatePresence>
              {talking && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="absolute -top-28 left-1/2 z-30 w-[240px] -translate-x-1/2 sm:-top-24 sm:w-[270px]"
                >
                  <div className="relative rounded-2xl border border-gold/40 bg-panel/95 px-4 py-3 text-sm font-medium text-white shadow-2xl shadow-black/80 backdrop-blur-xl">
                    <Typewriter
                      lines={[
                        "Hey there! 👋",
                        `Welcome to ${siteConfig.name}!`,
                        "So glad to have you here.",
                        "Let me show you what we build →",
                      ]}
                      onDone={onSpeechDone}
                    />
                    <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-panel" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button suppressHydrationWarning
              className="block w-full cursor-pointer"
              onMouseEnter={() => arrived && setPose("wave")}
              onMouseLeave={() => arrived && setPose("point")}
              onClick={() => openEnquiry()}
              aria-label="Open enquiry"
            >
              <GuideCharacter pose={pose} className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.button suppressHydrationWarning
        onClick={() => scrollToId("about")}
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-500 lg:flex"
      >
        Scroll
        <span className="flex h-9 w-5 justify-center rounded-full border border-white/20 pt-1.5">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-gold"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </span>
      </motion.button>
    </section>
  );
}

