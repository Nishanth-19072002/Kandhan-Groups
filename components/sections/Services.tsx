"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import GuideCharacter, { type GuidePose } from "@/components/guide/GuideCharacter";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { openEnquiry } from "@/components/ui/brand";
import { services } from "@/lib/content";
import { workTypes } from "@/lib/siteConfig";

function pickWork(i: number) {
  return services[i]?.workType || workTypes[Math.min(i, workTypes.length - 1)];
}

function ServiceCard({ s, i }: { s: (typeof services)[number]; i: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const featured = i === services.length - 1;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div className={featured ? "sm:col-span-2 xl:col-span-3" : ""}>
      <button suppressHydrationWarning
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => openEnquiry(s.workType || pickWork(i))}
        className={`group relative h-full w-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-left transition-[border-color,transform] duration-300 hover:border-gold/50 ${
          featured ? "md:flex md:items-center md:gap-8 bg-gradient-to-r from-gold/[0.1] to-cyan-bp/[0.07]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(245,165,36,0.18), transparent 50%)" }}
        />
        <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold/20 to-cyan-bp/10 text-gold ring-1 ring-white/10 transition group-hover:scale-110 group-hover:text-gold-2">
          <Icon name={s.icon} />
        </div>
        <div className="relative mt-5 md:mt-0">
          {featured && <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-bp">Signature Service</div>}
          <h3 className={`font-display font-semibold text-white ${featured ? "text-2xl" : "mt-0 text-lg"}`}>{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
        </div>
        <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold opacity-0 transition group-hover:opacity-100 md:ml-auto md:mt-0">
          Enquire <Icon name="arrow" className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [pose, setPose] = useState<GuidePose>("walk");
  const [isPulling, setIsPulling] = useState(false);
  const [boardLowered, setBoardLowered] = useState(false);
  const [speech, setSpeech] = useState<string>("Walking to the hoist station…");

  // Automatic sequence when scrolled into view
  useEffect(() => {
    if (!inView) return;

    // Step 1: Walk to hoist station
    setPose("walk");
    setSpeech("Walking to the hoist station…");

    const t1 = setTimeout(() => {
      // Step 2: Grab the cable and start pulling vigorously!
      setIsPulling(true);
      setPose("pull");
      setSpeech("Heave... HO! Pulling down the services board! 🏗️");
      setBoardLowered(true);
    }, 1200);

    const t2 = setTimeout(() => {
      // Step 3: Board locked in place, give thumbs up!
      setIsPulling(false);
      setPose("thumbs");
      setSpeech("There you go! Everything we build & manage. ✨");
    }, 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView]);

  // Interactive re-trigger when clicking "Re-Pull" or the engineer
  const triggerPull = () => {
    setBoardLowered(false);
    setIsPulling(true);
    setPose("pull");
    setSpeech("Pulling the hoist cable again! 💪");

    setTimeout(() => {
      setBoardLowered(true);
    }, 400);

    setTimeout(() => {
      setIsPulling(false);
      setPose("thumbs");
      setSpeech("Services board fully deployed! Pick any trade 👇");
    }, 3600);
  };

  return (
    <section id="services" ref={sectionRef} className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bp-grid opacity-30 [mask-image:linear-gradient(transparent,black_20%,black_80%,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section heading – strictly untouched by any ropes */}
        <SectionHeading
          eyebrow="What we offer"
          title="Every kind of civil work."
          highlight="One trusted team."
          subtitle="From company civil contracts to individual homes, excavation, planning, and trade finishing — we manage and execute it all from scratch."
        />

        {/* ────────── INDUSTRIAL GANTRY CRANE BEAM ────────── */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-gold/40 bg-ink/90 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-3 text-xs">
            {/* hazard stripes left */}
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 rounded bg-[repeating-linear-gradient(-45deg,#f5a524_0_8px,#0b1220_8px_16px)]" />
              <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-bp">
                <span className={`inline-block h-2 w-2 rounded-full ${isPulling ? "animate-ping bg-gold" : "bg-emerald-400"}`} />
                {isPulling ? "HOIST ACTIVE // PULLING CABLE..." : "HOIST RIG LOCKED // 10 DOMAINS DEPLOYED"}
              </div>
            </div>

            {/* Interactive button to re-trigger pulling */}
            <button suppressHydrationWarning
              onClick={triggerPull}
              className="shine group flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold-2 transition hover:bg-gold hover:text-ink"
            >
              <span className={isPulling ? "animate-spin" : ""}>⚙️</span>
              {isPulling ? "Hoisting..." : "Re-Pull Services Board"}
            </button>
          </div>

          {/* Gantry Truss Graphic with 2 Pulley Wheels */}
          <div className="relative h-14 bg-gradient-to-r from-panel via-ink to-panel px-6 py-2">
            {/* structural cross girders */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10" />

            {/* Pulley 1 (Left - directly above Engineer's Station) */}
            <div className="absolute left-[8%] sm:left-[11%] top-2 flex flex-col items-center">
              <motion.div
                animate={isPulling ? { rotate: 720 } : { rotate: 0 }}
                transition={isPulling ? { duration: 3.2, ease: "linear", repeat: Infinity } : { duration: 0.5 }}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold bg-ink text-gold shadow-[0_0_12px_#f5a524]"
              >
                <div className="h-3 w-3 rounded-full bg-gold" />
              </motion.div>
              {isPulling && (
                <span className="absolute -bottom-2 text-[9px] font-mono text-gold animate-pulse">SPARKS</span>
              )}
            </div>

            {/* Pulley 2 (Center-Right - above board right side) */}
            <div className="absolute right-[8%] sm:right-[11%] top-2 flex flex-col items-center">
              <motion.div
                animate={isPulling ? { rotate: 720 } : { rotate: 0 }}
                transition={isPulling ? { duration: 3.2, ease: "linear", repeat: Infinity } : { duration: 0.5 }}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold bg-ink text-gold shadow-[0_0_12px_#f5a524]"
              >
                <div className="h-3 w-3 rounded-full bg-gold" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ────────── MAIN HOIST STAGE: ENGINEER + BOARD ────────── */}
        <div className="relative mt-2 grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* CABLES RUNNING FROM GANTRY TO BOARD/ENGINEER ONLY */}
          {/* Cable from Pulley 2 straight down to board right */}
          <div className="pointer-events-none absolute right-[8%] sm:right-[11%] top-0 h-12 w-[3px] bg-[repeating-linear-gradient(180deg,#f5a524_0_6px,#0b1220_6px_10px)]" />
          {/* Cable from Pulley 1 straight down to board left */}
          <div className="pointer-events-none absolute left-[8%] sm:left-[11%] top-0 h-12 w-[3px] bg-[repeating-linear-gradient(180deg,#f5a524_0_6px,#0b1220_6px_10px)]" />

          {/* LEFT: ENGINEER HOIST OPERATOR STATION */}
          <div className="relative flex flex-col items-center pt-6 lg:items-start">
            <div className="lg:sticky lg:top-28 w-full max-w-[240px]">
              {/* SPEECH BUBBLE DIRECTLY ABOVE ENGINEER */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speech}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="relative z-30 mb-4 rounded-2xl border border-gold/40 bg-panel/95 p-3.5 text-xs sm:text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
                >
                  {speech}
                  {/* speech pointer tail */}
                  <div className="absolute -bottom-2 left-10 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-panel" />
                </motion.div>
              </AnimatePresence>

              {/* ENGINEER CHARACTER WITH PULL CABLE */}
              <div className="relative mx-auto w-[160px] sm:w-[190px] lg:w-[210px]">
                {/* Pull rope drop from gantry into his hands */}
                <div
                  className={`pointer-events-none absolute left-[65%] top-[-40px] h-[70px] w-[4px] bg-gradient-to-b from-gold via-amber-deep to-gold ${
                    isPulling ? "animate-pulse" : ""
                  }`}
                />

                <button suppressHydrationWarning
                  onClick={triggerPull}
                  className="group block w-full cursor-pointer text-left"
                  title="Click to pull services board!"
                >
                  <GuideCharacter pose={pose} className="w-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]" />
                </button>

                {/* Operator Pad glow */}
                <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center font-mono text-[10px] text-slate-400">
                  <span className="text-gold">ENGINEER RIG</span> · {isPulling ? "PULLING" : "READY"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: HANGING SERVICES SITE BOARD */}
          <div className="relative pt-6">
            <motion.div
              initial={false}
              animate={boardLowered ? { y: 0, opacity: 1 } : { y: -60, opacity: 0.3 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="relative"
            >
              <div className="glass relative rounded-3xl p-4 shadow-2xl shadow-black/70 sm:p-6">
                {/* Eye-bolt suspension rings on board */}
                <div className="absolute -top-3 left-[5%] grid h-6 w-6 place-items-center rounded-full border-2 border-gold bg-ink text-gold">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                </div>
                <div className="absolute -top-3 right-[5%] grid h-6 w-6 place-items-center rounded-full border-2 border-gold bg-ink text-gold">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                </div>

                {/* Board header */}
                <div className="mb-6 flex items-center justify-center sm:justify-between overflow-hidden rounded-2xl border border-gold/30 bg-ink/80 px-4 py-2.5">
                  <div className="hidden sm:block h-4 w-12 rounded bg-[repeating-linear-gradient(-45deg,#f5a524_0_6px,#0b1220_6px_12px)] sm:w-24 shrink-0" />
                  <div className="font-display text-[11px] sm:text-sm font-bold uppercase tracking-wider sm:tracking-[0.3em] text-gold-2 text-center">
                    Kandhan Groups · Official Civil Scope
                  </div>
                  <div className="hidden sm:block h-4 w-12 rounded bg-[repeating-linear-gradient(45deg,#f5a524_0_6px,#0b1220_6px_12px)] sm:w-24 shrink-0" />
                </div>

                {/* Service Cards Grid */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {services.map((s, i) => (
                    <ServiceCard key={s.title} s={s} i={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
