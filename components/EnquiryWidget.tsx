"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GuideAvatar } from "@/components/guide/GuideCharacter";
import EnquiryForm from "@/components/EnquiryForm";
import Icon from "@/components/ui/Icon";
import { siteConfig } from "@/lib/siteConfig";

const nudges = ["Need a quote? 👋", "Planning a project?", "Talk to an engineer!", "Free site consultation"];

export default function EnquiryWidget({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string | undefined>();
  const [nudge, setNudge] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ workType?: string }>).detail;
      setPreset(detail?.workType);
      setOpen(true);
    };
    window.addEventListener("open-enquiry", handler);
    return () => window.removeEventListener("open-enquiry", handler);
  }, []);

  useEffect(() => {
    if (!ready || open) return;
    let i = 0;
    const show = () => {
      setNudge(nudges[i % nudges.length]);
      i++;
      setTimeout(() => setNudge(null), 4500);
    };
    const first = setTimeout(show, 5000);
    const loop = setInterval(show, 16000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, [ready, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready) return null;

  const c = siteConfig.contact;

  return (
    <>
      {/* mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-[85] flex flex-col items-end sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              data-lenis-prevent
              className="fixed inset-x-0 bottom-0 mb-0 max-h-[88svh] origin-bottom-right overflow-y-auto rounded-t-3xl border border-white/10 bg-panel/95 shadow-2xl shadow-black/60 backdrop-blur-xl sm:static sm:mb-4 sm:max-h-[min(640px,calc(100svh-120px))] sm:w-[390px] sm:rounded-3xl"
            >
              {/* header */}
              <div className="relative overflow-hidden border-b border-white/10 p-5">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-cyan-bp/10" />
                <div className="relative flex items-center gap-3">
                  <div className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-ink ring-1 ring-gold/40">
                    <GuideAvatar className="h-11 w-11" />
                    <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-ink bg-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-white">Let&apos;s build together</div>
                    <div className="text-xs text-slate-400">Tell us about your project · we reply fast</div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    <Icon name="close" className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <EnquiryForm compact presetWork={preset} />
              </div>

              {/* contact strip */}
              <div className="border-t border-white/10 p-5 pt-4">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Or reach us directly</div>
                <div className="grid grid-cols-3 gap-2">
                  <a href={`tel:${c.phones[0]?.raw}`} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs text-slate-300 transition hover:border-gold/40 hover:text-gold">
                    <Icon name="phone" className="h-5 w-5" /> Call
                  </a>
                  <a href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Hi ${siteConfig.name}, I'd like to discuss a project.`)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-400">
                    <Icon name="whatsapp" className="h-5 w-5" /> WhatsApp
                  </a>
                  <a href={`mailto:${c.emails[0]}`} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs text-slate-300 transition hover:border-cyan-bp/50 hover:text-cyan-bp">
                    <Icon name="mail" className="h-5 w-5" /> Email
                  </a>
                </div>
                <div className="mt-3 text-center text-xs text-slate-400 space-y-0.5">
                  <div>{c.phones[0]?.display} · {c.phones[1]?.display}</div>
                  <div className="text-slate-500">{c.address}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* launcher */}
        <div className={`relative flex items-center gap-3 ${open ? "max-sm:hidden" : ""}`}>
          <AnimatePresence>
            {nudge && !open && (
              <motion.button
                onClick={() => setOpen(true)}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                className="glass whitespace-nowrap rounded-2xl rounded-br-sm px-4 py-2.5 text-sm font-medium text-white shadow-xl"
              >
                {nudge}
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.6 }}
            onClick={() => setOpen((o) => !o)}
            className="animate-float relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold to-amber-deep shadow-[0_10px_40px_-5px_rgba(245,165,36,0.7)]"
            aria-label="Open enquiry form"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/40 [animation-duration:2.5s]" />
            <span className="relative grid h-[56px] w-[56px] place-items-center overflow-hidden rounded-full bg-ink">
              {open ? <Icon name="close" className="h-6 w-6 text-gold" /> : <GuideAvatar className="mt-1 h-12 w-12" />}
            </span>
          </motion.button>
        </div>
      </div>
    </>
  );
}

