"use client";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon, { type IconName } from "@/components/ui/Icon";
import { KMark, openEnquiry } from "@/components/ui/brand";

const partners: { icon: IconName; label: string }[] = [
  { icon: "building", label: "Civil & Structural" },
  { icon: "bolt", label: "Electrical & MEP" },
  { icon: "paint", label: "Painting & Finishing" },
  { icon: "sofa", label: "Interiors" },
  { icon: "factory", label: "Fabrication & PEB" },
];

const roles = ["Plan", "Source", "Supervise", "Quality", "Bill"];

const without = [
  "Coordinate 5–10 contractors yourself",
  "Multiple quotes, invoices & payments",
  "Delays when one trade blocks another",
  "No single party accountable for quality",
];
const withUs = [
  "One contract, one point of contact",
  "One consolidated invoice from us",
  "Integrated schedule across all trades",
  "We own quality, safety & delivery",
];

function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <div className={`relative ${vertical ? "mx-auto h-14 w-[3px]" : "h-[3px] w-full"} overflow-hidden rounded-full bg-white/10`}>
      <div className={`absolute inset-0 ${vertical ? "flow-y" : "flow-x"}`} />
    </div>
  );
}

export default function PMCModel() {
  return (
    <section id="pmc" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bp-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Project Management Consultancy"
          title="You hand it over."
          highlight="We handle everything."
          subtitle="Our PMC model lets you outsource an entire project to us. We bring in vetted specialist contractors, manage every detail and bill you as one company."
        />

        {/* diagram */}
        <div className="mt-16 grid items-center gap-4 lg:grid-cols-[1fr_120px_1.3fr_120px_1fr]">
          {/* client */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-3xl p-6 text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-white ring-1 ring-white/10">
              <Icon name="user" className="h-7 w-7" />
            </div>
            <div className="mt-4 font-display text-xl font-bold text-white">You</div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Factory · Business · Homeowner</div>
            <p className="mt-3 text-sm text-slate-400">Share your requirement once. That&apos;s it.</p>
          </motion.div>

          <div className="hidden lg:block"><Connector /></div>
          <div className="lg:hidden"><Connector vertical /></div>

          {/* core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto grid aspect-square w-full max-w-[340px] place-items-center"
          >
            <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-gold/30" />
            <div className="absolute inset-6 rounded-full border border-cyan-bp/20" style={{ animation: "spin-slow 30s linear infinite reverse" }} />
            <div className="absolute inset-12 rounded-full bg-gold/10 blur-2xl" />
            {roles.map((r, i) => {
              const a = (i / roles.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <span
                  key={r}
                  className="absolute rounded-full border border-gold/40 bg-ink/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-2"
                  style={{ left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%`, transform: "translate(-50%,-50%)" }}
                >
                  {r}
                </span>
              );
            })}
            <div className="relative grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-panel to-ink text-center ring-1 ring-gold/50 glow-gold">
              <div>
                <KMark className="mx-auto h-12 w-12" />
                <div className="mt-2 font-display text-sm font-extrabold tracking-[0.2em] text-white">KANDHAN</div>
                <div className="text-[10px] tracking-[0.3em] text-gold">PMC CORE</div>
              </div>
            </div>
          </motion.div>

          <div className="hidden lg:block"><Connector /></div>
          <div className="lg:hidden"><Connector vertical /></div>

          {/* partners */}
          <div className="space-y-2.5">
            {partners.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-bp/10 text-cyan-bp">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-slate-200">{p.label}</span>
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </motion.div>
            ))}
            <div className="pl-1 pt-1 text-xs text-slate-500">Vetted specialist partners · managed &amp; billed by us</div>
          </div>
        </div>

        {/* comparison */}
        <div className="mt-20 grid gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-7"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Doing it yourself</div>
            <ul className="mt-5 space-y-3">
              {without.map((w) => (
                <li key={w} className="flex items-start gap-3 text-slate-400">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-400">
                    <Icon name="close" className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/[0.12] to-transparent p-7"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative text-xs font-semibold uppercase tracking-[0.25em] text-gold-2">With Kandhan PMC</div>
            <ul className="relative mt-5 space-y-3">
              {withUs.map((w) => (
                <li key={w} className="flex items-start gap-3 text-white">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-ink">
                    <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {w}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openEnquiry("Project Management Consultancy (PMC)")}
              className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              Outsource my project <Icon name="arrow" className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

