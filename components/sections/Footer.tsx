"use client";
import { Logo } from "@/components/ui/brand";
import { scrollToId } from "@/components/SmoothScroll";
import { siteConfig } from "@/lib/siteConfig";
import { services } from "@/lib/content";

export default function Footer() {
  const c = siteConfig.contact;
  return (
    <footer className="relative border-t border-white/5 pt-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <div className="mt-3 text-xs font-bold text-gold tracking-wide italic">
              &ldquo;{siteConfig.tagline}&rdquo;
            </div>
            <p className="mt-3 max-w-xs text-xs sm:text-sm leading-relaxed text-slate-400">{siteConfig.description}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-2">Company</div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {[
                ["services", "Services"],
                ["domains", "Core Sectors"],
                ["pmc", "PMC Engine"],
                ["tech", "Design & Tech"],
                ["contact", "Contact"],
              ].map(([id, l]) => (
                <li key={id}>
                  <button suppressHydrationWarning onClick={() => scrollToId(id)} className="transition hover:text-white">
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-2">Services</div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {services.slice(0, 6).map((s) => (
                <li key={s.title}>{s.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-2">Contact</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {c.phones.map((p) => (
                <li key={p.raw}>
                  <a href={`tel:${p.raw}`} className="hover:text-white transition">
                    {p.display}
                  </a>
                </li>
              ))}
              {c.emails.map((m) => (
                <li key={m}>
                  <a href={`mailto:${m}`} className="hover:text-white transition break-all">
                    {m}
                  </a>
                </li>
              ))}
              <li className="pt-1 text-slate-300">{c.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 overflow-hidden">
          <div className="select-none bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-center font-display text-[17vw] font-extrabold leading-[0.8] tracking-tighter text-transparent lg:text-[12.5rem]">
            KANDHAN
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-xs text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</div>
          <div>
            Designed &amp; engineered by <span className="text-gold-2">{siteConfig.name} Tech</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
