"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon, { type IconName } from "@/components/ui/Icon";
import { openEnquiry } from "@/components/ui/brand";

const cards: {
  tag: string;
  title: string;
  image: string;
  icon: IconName;
  desc: string;
  points: string[];
  work: string;
  accent: "gold" | "cyan";
}[] = [
  {
    tag: "Architectural Planning & 3D Design",
    title: "Designs & 3D elevations planned from scratch.",
    image: "/images/architecture.jpg",
    icon: "compass",
    desc: "Walk through your dream building before laying a single brick. We provide complete architectural planning, photorealistic 3D elevations, structural blueprints, and Vastu-compliant layouts.",
    points: [
      "Architectural 2D floor plans & site layouts",
      "Photorealistic 3D elevations & walkthroughs",
      "Structural engineering & working drawings",
      "Vastu-aware designs & space optimization",
    ],
    work: "Architectural Planning & 3D Design",
    accent: "gold",
  },
  {
    tag: "Software & Smart Home Automation",
    title: "Software solutions & home automation control for you.",
    image: "/images/software.jpg",
    icon: "code",
    desc: "We build custom software solutions and integrate intelligent home automation systems. Control your lighting, appliances, smart switches, and project tracking easily right from your phone.",
    points: [
      "Smart home automation & IoT mobile controls",
      "Automated lighting & smart appliance controls",
      "Custom business software & web portals",
      "Client project tracking & digital dashboards",
    ],
    work: "Software Solutions & Smart Home Automation",
    accent: "cyan",
  },
];

export default function TechSolutions() {
  return (
    <section id="tech" className="relative overflow-hidden py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Beyond Bricks"
          title="Architecture, Software &"
          highlight="Home Automation."
          subtitle="Architectural blueprint design combined with modern software solutions and smart home automation control for you."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {cards.map((c, i) => (
            <motion.div
              key={c.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-panel transition hover:border-gold/40"
            >
              <div className="relative h-56 overflow-hidden sm:h-64">
                <Image
                  src={c.image}
                  alt={c.tag}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />
                <div
                  className={`absolute left-5 top-5 flex items-center gap-2 rounded-full border bg-ink/75 px-3 py-1.5 text-xs font-semibold backdrop-blur ${
                    c.accent === "gold" ? "border-gold/40 text-gold-2" : "border-cyan-bp/40 text-cyan-bp"
                  }`}
                >
                  <Icon name={c.icon} className="h-4 w-4" />
                  {c.tag}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{c.desc}</p>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {c.points.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.accent === "gold" ? "bg-gold" : "bg-cyan-bp"}`} />
                      {p}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">KANDHAN TECH DIVISION</span>
                  <button
                    onClick={() => openEnquiry(c.work)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition ${
                      c.accent === "gold"
                        ? "bg-gold text-ink hover:brightness-110"
                        : "bg-cyan-bp text-ink hover:brightness-110"
                    }`}
                  >
                    Discuss Scope <Icon name="arrow" className="h-3.5 w-3.5" strokeWidth={2.2} />
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
