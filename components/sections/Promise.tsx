"use client";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { promises } from "@/lib/content";

export default function OurPromise() {
  return (
    <section id="promise" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-gold/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our promise"
          title="No inflated numbers."
          highlight="Just real commitments."
          subtitle="We're a new company, and we see that as an advantage. You get our full attention, the founders on your project and a reputation we're building one honest job at a time."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-transparent p-7"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/25 transition group-hover:rotate-6 group-hover:bg-gold group-hover:text-ink">
                  <Icon name={p.icon} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-cyan-bp/20 bg-cyan-bp/[0.04] p-6 text-center sm:flex-row sm:text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🏗️</span>
            <div>
              <div className="font-display text-lg font-semibold text-white">Founding-client advantage</div>
              <div className="text-sm text-slate-400">Early clients get priority scheduling and direct founder involvement on every project.</div>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-bp/40 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cyan-bp">
            Limited slots
          </span>
        </motion.div>
      </div>
    </section>
  );
}
