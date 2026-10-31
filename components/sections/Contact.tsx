"use client";
import { motion } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import Icon, { type IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/siteConfig";

export default function Contact() {
  const c = siteConfig.contact;

  return (
    <section id="contact" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-gold/10 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Get in touch
            </div>
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Let&apos;s build something <span className="text-gradient-gold">remarkable.</span>
            </h2>
            <p className="mt-4 max-w-md text-slate-400">
              A factory expansion, your dream home, or an entire project you want turnkey managed. Consultations and estimates are completely free.
            </p>

            <div className="mt-8 space-y-3">
              {/* Phone Numbers */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                    <Icon name="phone" className="h-4 w-4" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Call Us</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pl-12 text-sm">
                  {c.phones.map((p) => (
                    <a key={p.raw} href={`tel:${p.raw}`} className="text-white hover:text-gold transition font-medium">
                      {p.display}
                    </a>
                  ))}
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent("Hi Kandhan Groups, I would like to discuss a project.")}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 transition group-hover:scale-110">
                  <Icon name="whatsapp" className="h-4 w-4" />
                </span>
                <div>
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">WhatsApp</span>
                  <span className="block text-sm font-medium text-white group-hover:text-emerald-400 transition">
                    Chat with an Engineer Instantly
                  </span>
                </div>
              </a>

              {/* Email IDs */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-bp/10 text-cyan-bp">
                    <Icon name="mail" className="h-4 w-4" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Email Us</span>
                </div>
                <div className="flex flex-col gap-1 pl-12 text-sm">
                  {c.emails.map((m) => (
                    <a key={m} href={`mailto:${m}`} className="text-white hover:text-cyan-bp transition font-medium">
                      {m}
                    </a>
                  ))}
                </div>
              </div>

              {/* Office Location */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                  <Icon name="pin" className="h-4 w-4" />
                </span>
                <div>
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Office Location</span>
                  <span className="block text-sm font-medium text-white">{c.address}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-xs text-slate-500">
              Serving: <span className="text-slate-300">{c.serviceArea}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-gold/50 via-transparent to-cyan-bp/40" />
            <div className="relative rounded-[2rem] bg-panel p-6 sm:p-9">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Request a Free Consultation</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">Enter your details and our team will get in touch shortly.</p>
              <div className="mt-6">
                <EnquiryForm />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
