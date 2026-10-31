"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { openEnquiry } from "@/components/ui/brand";
import { specializations } from "@/lib/content";

export default function Specializations() {
  const [active, setActive] = useState(0);
  const s = specializations[active];

  return (
    <section id="specializations" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-bp/[0.06] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our specializations"
          title="Deep expertise,"
          highlight="engineered in detail."
          subtitle="Pick a domain and see how we approach it: the scope we cover and what you can expect from us."
        />

        {/* tabs */}
        <div className="mt-12 flex justify-center">
          <div className="glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none]">
            {specializations.map((sp, i) => (
              <button
                key={sp.key}
                onClick={() => setActive(i)}
                className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition sm:px-5 ${
                  active === i ? "text-ink" : "text-slate-300 hover:text-white"
                }`}
              >
                {active === i && (
                  <motion.span
                    layoutId="spec-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-gold-2"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon name={sp.icon} className="relative h-4 w-4" />
                <span className="relative">{sp.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid items-stretch gap-8 lg:grid-cols-2"
            >
              {/* image */}
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                className="scanline group relative min-h-[300px] overflow-hidden rounded-3xl border border-white/10 sm:min-h-[420px]"
              >
                <motion.div
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image src={s.image} alt={s.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority={active === 0} />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                {/* HUD brackets */}
                {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "left-4 bottom-4 border-l-2 border-b-2", "right-4 bottom-4 border-r-2 border-b-2"].map((c) => (
                  <span key={c} className={`absolute h-6 w-6 border-gold/80 ${c}`} />
                ))}
                <div className="absolute left-6 top-6 rounded-full border border-cyan-bp/40 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-bp backdrop-blur">
                  ● AI Concept Visual
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="font-mono text-[11px] text-gold-2">0{active + 1} / 0{specializations.length}</div>
                  <div className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{s.label}</div>
                </div>
              </motion.div>

              {/* details */}
              <div className="glass flex flex-col rounded-3xl p-7 sm:p-9">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="font-display text-2xl font-bold text-white sm:text-3xl"
                >
                  {s.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-4 leading-relaxed text-slate-400"
                >
                  {s.description}
                </motion.p>

                <div className="mt-7 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-bp">Scope of work</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {s.scope.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                        <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-7 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-bp">What you get</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.outcomes.map((o) => (
                    <span key={o} className="rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-medium text-gold-2">
                      {o}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => openEnquiry()}
                  className="shine group mt-auto flex w-fit items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-2 max-lg:mt-8 lg:mt-8"
                >
                  Discuss your project
                  <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" strokeWidth={2.2} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
