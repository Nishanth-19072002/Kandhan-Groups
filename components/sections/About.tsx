"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";

const statement =
  "Kandhan Groups is a new-age construction and project management company. From factory floors to family homes, we plan, build and manage everything, so you deal with one trusted partner from the first brick to the final handover.";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const color = useTransform(progress, range, ["#64748b", "#f8fafc"]);
  return (
    <motion.span style={{ opacity, color }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

const pillars: { icon: IconName; title: string; tag: string; desc: string }[] = [
  { icon: "hardhat", title: "We Build", tag: "Construction", desc: "Industrial, commercial and residential civil works delivered by skilled crews under strict quality control." },
  { icon: "clipboard", title: "We Manage", tag: "PMC", desc: "We own your project end-to-end: planning, contractors, supervision and turnkey delivery. You stay stress-free." },
  { icon: "spark", title: "We Innovate", tag: "Design & Tech", desc: "Architectural design, 3D visualisation and smart software solutions for modern projects." },
];

const ticker = [
  "Industrial Civil Works", "Residential Homes", "Commercial Buildings", "Project Management", "Painting",
  "Plumbing", "Electrical", "Waterproofing", "Interiors", "Architecture", "Software Solutions",
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = statement.split(" ");

  return (
    <section id="about" className="relative py-24 md:py-32">
      {/* ticker */}
      <div className="relative -mt-8 mb-24 overflow-hidden border-y border-white/5 bg-white/[0.02] py-5 md:mb-32">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-xl font-semibold text-slate-500 md:text-2xl">
              {t}
              <Icon name="spark" className="h-4 w-4 text-gold" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-2">— Who we are</div>
        <div ref={ref}>
          <p className="font-display text-2xl font-semibold leading-snug sm:text-3xl md:text-[2.6rem] md:leading-[1.25]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                {w}
              </Word>
            ))}
          </p>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group glass relative overflow-hidden rounded-3xl p-7 transition hover:-translate-y-1 hover:border-gold/40"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl transition group-hover:bg-gold/25" />
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold/25 to-transparent text-gold ring-1 ring-gold/30">
                  <Icon name={p.icon} />
                </div>
                <span className="font-mono text-[11px] text-slate-500">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">{p.title}</h3>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-bp">{p.tag}</div>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

