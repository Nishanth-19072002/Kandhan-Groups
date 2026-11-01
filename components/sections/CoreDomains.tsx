"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon, { type IconName } from "@/components/ui/Icon";
import { openEnquiry } from "@/components/ui/brand";

type Domain = {
  key: string;
  tag: string;
  icon: IconName;
  title: string;
  image: string;
  desc: string;
  bullets: string[];
  workType: string;
};

const domains: Domain[] = [
  {
    key: "industrial",
    tag: "Corporate & Factory Civil",
    icon: "factory",
    title: "Civil Work Contracts Inside Companies & Factories",
    image: "/images/industrial.jpg",
    desc: "Specialized civil contracts executed directly inside running companies, plants, and industrial facilities. Equipment foundations, internal modifications, industrial flooring, compound repairs, and plant maintenance.",
    bullets: ["Civil contracts inside factories & IT companies", "Heavy machine foundations & equipment beds", "VDF / epoxy flooring & concrete repairs", "Internal partitions & plant maintenance"],
    workType: "Civil Work Contracts Inside Companies & Factories",
  },
  {
    key: "residential",
    tag: "Turnkey Residential",
    icon: "home",
    title: "Individual Homes & Residential Buildings",
    image: "/images/residential.jpg",
    desc: "Complete construction of individual houses and residential buildings from scratch to finishing. We take projects, manage every detail, execute with quality, and hand over the keys ready to live in.",
    bullets: ["Individual homes, villas & residential buildings", "Complete scratch-to-finishing construction", "Bhoomi pooja to housewarming delivery", "Vastu-aligned architectural layouts & design"],
    workType: "Individual Homes & Residential Buildings",
  },
  {
    key: "planning",
    tag: "Excavation & Design",
    icon: "compass",
    title: "Building Excavation, Architecture & Planning",
    image: "/images/architecture.jpg",
    desc: "Setting the foundation right with professional site excavation, 2D/3D architectural drawings, structural calculations, and creative elevation designs tailored for your plot.",
    bullets: ["Precision building excavation & earthwork", "Architectural 2D floor plans & 3D elevations", "Structural engineering & blueprint approvals", "Complete site planning & layout design"],
    workType: "Building Excavation, Architecture & Planning",
  },
  {
    key: "finishing",
    tag: "Trade Contracts",
    icon: "paint",
    title: "Plumbing, Painting & Finishing Contracts",
    image: "/images/finishing.jpg",
    desc: "Dedicated specialist contracting for individual trades or full buildings. Premium interior & exterior painting, high-pressure plumbing networks, waterproofing, and flawless finishes.",
    bullets: ["Interior & exterior painting contracts", "Plumbing & sanitation pipeline networks", "Waterproofing, tile & granite installations", "End-to-end execution with verified materials"],
    workType: "Plumbing, Painting & Finishing Contracts",
  },
];

export default function CoreDomains() {
  return (
    <section id="domains" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-bp/[0.05] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Core Domains"
          title="Engineered expertise across"
          highlight="our 4 core sectors."
          subtitle="From excavation and architectural planning to company civil works, individual homes, and complete trade execution — we provide everything from scratch to finishing, managing and delivering turnkey results."
        />

        {/* 4 Cards visible side-by-side (2x2 grid) — NO HIDDEN TABS */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {domains.map((d, i) => (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group glass relative flex flex-col overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:border-gold/50"
            >
              {/* Image banner */}
              <div className="relative h-52 w-full overflow-hidden sm:h-60">
                <Image
                  src={d.image}
                  alt={d.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />

                {/* Domain Pill Tag */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-gold/40 bg-ink/75 px-3 py-1 text-xs font-semibold text-gold-2 backdrop-blur-md">
                  <Icon name={d.icon} className="h-3.5 w-3.5" />
                  {d.tag}
                </div>
              </div>

              {/* Content body */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-display text-xl font-bold text-white transition group-hover:text-gold-2 sm:text-2xl">
                  {d.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                  {d.desc}
                </p>

                {/* Bullets */}
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {d.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {b}
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-bp/80">SECTOR 0{i + 1}</span>
                  <button
                    onClick={() => openEnquiry(d.workType)}
                    className="shine group/btn inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gold hover:text-ink"
                  >
                    Discuss Project
                    <Icon name="arrow" className="h-3 w-3 transition group-hover/btn:translate-x-1" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

