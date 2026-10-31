"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { processSteps } from "@/lib/content";

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  return (
    <section id="process" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How we work"
          title="From first call to"
          highlight="final handover."
          subtitle="A clear, structured process so you always know what's happening, what's next and when it will be done."
        />

        <div ref={ref} className="relative mt-20">
          {/* spine */}
          <div className="absolute bottom-0 left-6 top-0 w-[2px] bg-white/10 md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            style={{ scaleY }}
            className="absolute bottom-0 left-6 top-0 w-[2px] origin-top bg-gradient-to-b from-gold via-gold-2 to-cyan-bp shadow-[0_0_14px_#f5a524] md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-12 md:space-y-16">
            {processSteps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <div key={s.title} className="relative grid items-center md:grid-cols-2 md:gap-16">
                  {/* node */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="absolute left-6 top-6 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border border-gold/50 bg-ink text-gold shadow-[0_0_20px_rgba(245,165,36,0.35)] md:left-1/2 md:top-1/2 md:-translate-y-1/2"
                  >
                    <Icon name={s.icon} className="h-5 w-5" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: right ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`ml-16 md:ml-0 ${right ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}
                  >
                    <div className="glass group rounded-3xl p-6 transition hover:border-gold/40 sm:p-7">
                      <div className={`flex items-center gap-3 ${right ? "" : "md:flex-row-reverse"}`}>
                        <span className="font-display text-4xl font-extrabold text-white/10 transition group-hover:text-gold/30">
                          0{i + 1}
                        </span>
                        <h3 className="font-display text-xl font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

