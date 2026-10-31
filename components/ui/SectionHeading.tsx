"use client";
import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className={`inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-2`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_#f5a524]" />
        {eyebrow}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
      >
        {title} {highlight && <span className="text-gradient-gold">{highlight}</span>}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-5 text-base leading-relaxed text-slate-400 md:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

