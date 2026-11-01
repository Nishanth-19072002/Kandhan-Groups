"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Logo, openEnquiry } from "@/components/ui/brand";
import Icon from "@/components/ui/Icon";
import { scrollToId } from "@/components/SmoothScroll";

const links = [
  { id: "services", label: "Services" },
  { id: "domains", label: "Capabilities" },
  { id: "pmc", label: "PMC Engine" },
  { id: "tech", label: "Design & Tech" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <motion.div style={{ scaleX }} className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-cyan-bp via-gold to-gold-2" />
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "py-2.5" : "py-5"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-6 ${
            scrolled ? "glass mx-3 shadow-2xl shadow-black/40 sm:mx-6 xl:mx-auto" : ""
          }`}
        >
          <button onClick={() => go("top")} aria-label="Home">
            <Logo />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="group relative px-3 py-2 text-sm text-slate-300 transition hover:text-white"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEnquiry()}
              className="shine hidden rounded-full bg-gradient-to-r from-gold to-amber-deep px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110 sm:block"
            >
              Get a Quote
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white lg:hidden"
              aria-label="Menu"
            >
              <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="glass mx-3 mt-2 rounded-2xl p-3 lg:hidden"
            >
              {links.map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => go(l.id)}
                  className="block w-full rounded-xl px-4 py-3 text-left text-slate-200 hover:bg-white/5"
                >
                  {l.label}
                </motion.button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  openEnquiry();
                }}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-gold to-amber-deep px-4 py-3 font-semibold text-ink"
              >
                Get a Quote
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

