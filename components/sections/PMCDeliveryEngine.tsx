"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon, { type IconName } from "@/components/ui/Icon";
import { KMark, openEnquiry } from "@/components/ui/brand";
import { processSteps } from "@/lib/content";

const pmcFeatures: { icon: IconName; title: string; desc: string }[] = [
  { icon: "user", title: "One Point of Contact", desc: "A dedicated project manager owns every milestone on site." },
  { icon: "layers", title: "Single Consolidated Bill", desc: "Multiple contractor trades billed under one transparent invoice." },
  { icon: "shield", title: "Guaranteed QA / QC", desc: "Stage-wise audits, branded materials, and structural warranties." },
];

export default function PMCDeliveryEngine() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="pmc" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bp-grid opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Delivery Engine & PMC"
          title="You hand over the project."
          highlight="We manage everything."
          subtitle="One contract, one consolidated invoice, and zero headache. We coordinate vetted specialist contractors while our engineers supervise every stage."
        />

        {/* ────────── 1. PMC TRIANGLE FLOW BAR ────────── */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-gold/30 bg-panel/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr]">
            {/* You */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-white">
                <Icon name="user" className="h-6 w-6" />
              </div>
              <div className="mt-2 font-display font-bold text-white">You (The Client)</div>
              <p className="text-xs text-slate-400 mt-1">Industrialist · Builder · Homeowner</p>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex flex-col items-center text-gold">
              <span className="font-mono text-[10px] tracking-widest text-gold uppercase">1 Contract</span>
              <Icon name="arrow" className="h-5 w-5" />
            </div>

            {/* Kandhan Groups Core */}
            <div className="relative rounded-2xl border border-gold/50 bg-gradient-to-br from-gold/15 via-panel to-panel p-5 text-center shadow-[0_0_25px_rgba(245,165,36,0.2)]">
              <div className="flex items-center justify-center gap-2">
                <KMark className="h-7 w-7" />
                <span className="font-display font-extrabold tracking-wider text-white">KANDHAN GROUPS</span>
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-gold">
                PMC &amp; Project Management Core
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {["Supervision", "Procurement", "Quality Audit", "Single Billing"].map((tag) => (
                  <span key={tag} className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-medium text-gold-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex flex-col items-center text-cyan-bp">
              <span className="font-mono text-[10px] tracking-widest text-cyan-bp uppercase">We Outsource</span>
              <Icon name="arrow" className="h-5 w-5" />
            </div>

            {/* Subcontractors */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-cyan-bp/10 text-cyan-bp">
                <Icon name="hardhat" className="h-6 w-6" />
              </div>
              <div className="mt-2 font-display font-bold text-white">Specialist Trades</div>
              <p className="text-xs text-slate-400 mt-1">Civil · MEP · Steel · Painting · Interiors</p>
            </div>
          </div>

          {/* 3 Quick Value Badges */}
          <div className="mt-6 pt-6 border-t border-white/10 grid gap-4 sm:grid-cols-3">
            {pmcFeatures.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                  <Icon name={f.icon} className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ────────── 2. HORIZONTAL 6-STEP BUILD TIMELINE ────────── */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-bp">
                6-Step Execution Standard
              </div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                From First Call to Handover
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">Click any step to inspect</span>
          </div>

          {/* Horizontal Step Buttons Track */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {processSteps.map((step, i) => {
              const selected = activeStep === i;
              return (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(i)}
                  className={`group relative flex flex-col items-center rounded-2xl p-3 text-center transition-all ${
                    selected
                      ? "border border-gold bg-gold/15 shadow-[0_0_15px_rgba(245,165,36,0.3)]"
                      : "border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-bold ${
                      selected ? "text-gold-2" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div
                    className={`mt-1.5 grid h-9 w-9 place-items-center rounded-xl transition ${
                      selected ? "bg-gold text-ink" : "bg-white/5 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    <Icon name={step.icon} className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-white line-clamp-1">{step.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Step Info Card */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-panel/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold font-mono font-bold text-sm">
                0{activeStep + 1}
              </span>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  {processSteps[activeStep]?.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {processSteps[activeStep]?.desc}
                </p>
              </div>
            </div>

            <button
              onClick={() => openEnquiry("Project Management Consultancy (PMC)")}
              className="shine shrink-0 self-start sm:self-auto rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition hover:brightness-110"
            >
              Start Project Step →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

