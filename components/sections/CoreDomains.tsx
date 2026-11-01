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
    key: "company-civil",
    tag: "Company & Factory Civil",
    icon: "factory",
    title: "Civil Work Contracts Inside Companies & Factories",
    image: "/images/industrial.jpg",
    desc: "Specialized civil contracts executed directly inside running companies, plants, and manufacturing facilities. Civil modifications, VDF and epoxy concrete flooring, internal structural alterations, and facility expansions.",
    bullets: [
      "Civil contracts inside factories & companies",
      "Equipment foundation pads & RCC pedestals",
      "VDF / epoxy flooring & concrete repairs",
      "Internal partitions & structural alterations",
    ],
    workType: "Civil Work Contracts Inside Companies & Factories",
  },
  {
    key: "residential",
    tag: "Residential Construction",
    icon: "home",
    title: "Individual Homes & Residential Buildings",
    image: "/images/residential.jpg",
    desc: "Complete construction of individual houses, villas, and residential buildings from scratch to finishing. We take projects, manage every detail, execute with quality, and hand over the keys ready to live in.",
    bullets: [
      "Individual houses, villas & apartments",
      "Complete scratch-to-finishing construction",
      "Bhoomi pooja to housewarming delivery",
      "Vastu-aligned architectural layouts & design",
    ],
    workType: "Individual Homes & Residential Buildings",
  },
  {
    key: "excavation-design",
    tag: "Excavation & Architecture",
    icon: "compass",
    title: "Building Excavation, Architecture & Planning",
    image: "/images/architecture.jpg",
    desc: "Setting the foundation right with professional site excavation, 2D/3D architectural drawings, structural calculations, and creative elevation designs tailored for your plot.",
    bullets: [
      "Precision building excavation & earthwork",
      "Architectural 2D floor plans & 3D elevations",
      "Structural engineering & blueprint approvals",
      "Complete site planning & layout design",
    ],
    workType: "Building Excavation, Architecture & Planning",
  },
  {
    key: "trade-contracts",
    tag: "Plumbing & Painting",
    icon: "paint",
    title: "Plumbing, Painting & Finishing Contracts",
    image: "/images/finishing.jpg",
    desc: "Dedicated trade contracts for individual works or full buildings. Premium interior & exterior painting, high-pressure plumbing networks, waterproofing, and flawless finishes.",
    bullets: [
      "Interior & exterior painting contracts",
      "Plumbing & sanitation pipeline networks",
      "Waterproofing, tile & granite installations",
      "End-to-end execution with verified materials",
    ],
    workType: "Plumbing, Painting & Finishing Contracts",
  },
  {
    key: "automation-software",
    tag: "Smart Automation & Tech",
    icon: "code",
    title: "Smart Home Automation & Software Solutions",
    image: "/images/software.jpg",
    desc: "Intelligent smart home automation combined with custom software. Control your lighting, appliances, smart switches, and client project tracking directly from your phone.",
    bullets: [
      "Smart home automation & app controls",
      "Automated lighting & smart appliance control",
      "Custom business software & web portals",
      "Live project tracking dashboards for clients",
    ],
    workType: "Software Solutions & Smart Home Automation",
  },
  {
    key: "turnkey-pmc",
    tag: "Turnkey Project Management",
    icon: "clipboard",
    title: "Complete Project Management: Take, Execute & Handover",
    image: "/images/pmc.jpg",
    desc: "We take entire projects under our management, execute every single phase, coordinate all trades, and hand over a finished building — one single bill, zero client hassle.",
    bullets: [
      "End-to-end project execution & supervision",
      "Vetted specialist contractors coordination",
      "Commitment to timelines & transparent billing",
      "Complete handover from scratch to finishing",
    ],
    workType: "Turnkey Project Management (Scratch to Finishing)",
  },
];

export default function CoreDomains() {
  return (
    <section id="domains" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-bp/[0.05] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our Full Capabilities"
          title="From scratch to handover."
          highlight="We build, manage & deliver everything."
          subtitle="No limits and no contractor juggling. From company civil contracts and residential builds to excavation, architectural planning, trade contracting, and smart home automation — we take your project, manage every detail, execute with quality, and hand over the keys."
        />

        {/* All Capabilities visible side-by-side in responsive grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, i) => (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group glass relative flex flex-col overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:border-gold/50"
            >
              {/* Image banner */}
              <div className="relative h-48 w-full overflow-hidden sm:h-52">
                <Image
                  src={d.image}
                  alt={d.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold text-white transition group-hover:text-gold-2 sm:text-xl">
                  {d.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                  {d.desc}
                </p>

                {/* Bullets */}
                <div className="mt-4 grid gap-1.5">
                  {d.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {b}
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-bp/80">CAPABILITY 0{i + 1}</span>
                  <button
                    onClick={() => openEnquiry(d.workType)}
                    className="shine group/btn inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-gold hover:text-ink"
                  >
                    Discuss Scope
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

