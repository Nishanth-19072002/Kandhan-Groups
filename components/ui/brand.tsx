import { siteConfig } from "@/lib/siteConfig";

export function openEnquiry(workType?: string) {
  window.dispatchEvent(new CustomEvent("open-enquiry", { detail: { workType } }));
}

export function KMark({ className = "h-9 w-9" }: { className?: string }) {
  if (siteConfig.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={siteConfig.logo}
        alt={siteConfig.name}
        className={`${className} rounded-xl object-contain drop-shadow-[0_0_12px_rgba(245,165,36,0.35)]`}
      />
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="kmark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="0.5" stopColor="#f5a524" />
          <stop offset="1" stopColor="#c46a05" />
        </linearGradient>
      </defs>
      <path d="M24 2 L44 13 V35 L24 46 L4 35 V13 Z" fill="none" stroke="url(#kmark)" strokeWidth="2.5" />
      <path d="M17 14 V34 M17 25 L30 14 M21 22 L31 34" stroke="url(#kmark)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  if (siteConfig.logo) {
    return (
      <span className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteConfig.logo}
          alt={siteConfig.name}
          className="h-10 w-14 rounded-xl object-contain bg-[#070b14]/90 p-0.5 ring-1 ring-gold/40 shadow-[0_0_15px_rgba(245,165,36,0.35)]"
        />
        {!compact && (
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-extrabold tracking-[0.16em] text-white">KANDHAN</span>
            <span className="block text-[9.5px] font-semibold tracking-[0.55em] text-gold">GROUPS</span>
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      <KMark />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[17px] font-extrabold tracking-[0.18em] text-white">KANDHAN</span>
          <span className="block text-[9.5px] font-semibold tracking-[0.55em] text-gold">GROUPS</span>
        </span>
      )}
    </span>
  );
}
