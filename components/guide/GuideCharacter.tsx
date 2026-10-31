"use client";
import "./guide.css";
import { useId } from "react";

export type GuidePose = "idle" | "walk" | "wave" | "pull" | "point" | "thumbs";

const SKIN = "#b9764a";
const SKIN_DARK = "#9a5f39";
const JACKET = "#1e3a5f";
const JACKET_LIGHT = "#2b4f7e";
const PANTS = "#253246";
const BOOT = "#0b1220";

export default function GuideCharacter({
  pose = "idle",
  className = "",
}: {
  pose?: GuidePose;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const hat = `hat-${uid}`;
  const vest = `vest-${uid}`;
  const clip = `clip-${uid}`;
  const glow = `glow-${uid}`;

  const arm = (side: "l" | "r") => {
    const x = side === "l" ? 76 : 144;
    return (
      <g className={`g-arm-${side}`}>
        <rect x={x - 9} y={112} width={18} height={62} rx={9} fill={JACKET} />
        <circle cx={x} cy={120} r={11} fill={JACKET} />
        <rect x={x - 9} y={128} width={18} height={5} fill="#e5e7eb" opacity={0.85} />
        <g className={`g-fore-${side}`}>
          <rect x={x - 8} y={166} width={16} height={54} rx={8} fill={JACKET_LIGHT} />
          <rect x={x - 8} y={208} width={16} height={6} rx={2} fill="#f5a524" />
          <circle cx={x} cy={224} r={10} fill={SKIN} />
          {side === "r" && (
            <path className="g-thumb" d="M146 226 L154 234" stroke={SKIN} strokeWidth={7} strokeLinecap="round" />
          )}
        </g>
      </g>
    );
  };

  const leg = (side: "l" | "r") => {
    const x = side === "l" ? 95 : 125;
    return (
      <g className={`g-leg-${side}`}>
        <rect x={x - 11} y={212} width={22} height={76} rx={10} fill={PANTS} />
        <g className={`g-shin-${side}`}>
          <rect x={x - 10} y={278} width={20} height={66} rx={9} fill={PANTS} />
          <rect x={x - 10} y={318} width={20} height={4} fill="#cbd5e1" opacity={0.8} />
          <rect x={side === "l" ? x - 17 : x - 13} y={336} width={30} height={18} rx={7} fill={BOOT} />
          <rect x={side === "l" ? x - 17 : x - 13} y={348} width={30} height={6} rx={3} fill="#f5a524" opacity={0.85} />
        </g>
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 220 380"
      className={`guide pose-${pose} ${className}`}
      role="img"
      aria-label="Kandhan Groups site engineer guide"
    >
      <defs>
        <linearGradient id={hat} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="0.45" stopColor="#f5a524" />
          <stop offset="1" stopColor="#c46a05" />
        </linearGradient>
        <linearGradient id={vest} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb938" />
          <stop offset="1" stopColor="#e07b06" />
        </linearGradient>
        <clipPath id={clip}>
          <path d="M80 112 L100 108 L110 150 L120 108 L140 112 L138 220 Q110 227 82 220 Z" />
        </clipPath>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* hologram floor glow */}
      <ellipse cx="110" cy="362" rx="90" ry="16" fill={`url(#${glow})`} />
      <ellipse className="g-shadow" cx="110" cy="360" rx="52" ry="7" fill="#000" opacity="0.35" />

      <g className="g-body">
        {/* Heavy industrial hoist cable with gold pull-handle ring */}
        <g className="g-rope">
          <line x1="144" y1="-300" x2="144" y2="340" stroke="#f5a524" strokeWidth="4.5" strokeLinecap="round" />
          <line className="g-rope-line" x1="144" y1="-300" x2="144" y2="340" stroke="#0b1220" strokeWidth="2.5" strokeDasharray="6 6" />
          <rect x="136" y="270" width="16" height="8" rx="2" fill="#d97706" />
          <circle cx="144" cy="290" r="9" fill="none" stroke="#f5a524" strokeWidth="3" />
        </g>

        {leg("l")}
        {leg("r")}

        {/* torso */}
        <path d="M74 118 Q74 108 86 106 L134 106 Q146 108 146 118 L142 222 Q110 230 78 222 Z" fill={JACKET} />
        <path d="M80 112 L100 108 L110 150 L120 108 L140 112 L138 220 Q110 227 82 220 Z" fill={`url(#${vest})`} />
        <g clipPath={`url(#${clip})`}>
          <rect x="76" y="168" width="70" height="7" fill="#eef2f7" opacity="0.92" />
          <rect x="76" y="190" width="70" height="7" fill="#eef2f7" opacity="0.92" />
        </g>
        <path d="M100 108 L110 134 L120 108 Z" fill={JACKET_LIGHT} />
        <line x1="110" y1="134" x2="110" y2="218" stroke="#b45309" strokeWidth="1.5" opacity="0.6" />
        <circle cx="127" cy="134" r="7.5" fill="#0b1220" stroke="#f5a524" strokeWidth="1.2" />
        <text x="127" y="137.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#f5a524" fontFamily="sans-serif">K</text>
        <rect x="80" y="212" width="60" height="9" rx="3" fill="#0b1220" />
        <rect x="104" y="211" width="12" height="11" rx="2" fill="#f5a524" />

        {/* neck */}
        <rect x="101" y="94" width="18" height="16" rx="4" fill={SKIN_DARK} />

        {/* head */}
        <g className="g-head">
          <circle cx="80" cy="76" r="6.5" fill={SKIN_DARK} />
          <circle cx="140" cy="76" r="6.5" fill={SKIN_DARK} />
          <ellipse cx="110" cy="74" rx="30" ry="32" fill={SKIN} />
          <path d="M80 66 Q82 80 84 84 L86 64 Z" fill="#1a1210" />
          <path d="M140 66 Q138 80 136 84 L134 64 Z" fill="#1a1210" />
          <path d="M92 64 Q99 60 105 63" stroke="#1a1210" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M115 63 Q121 60 128 64" stroke="#1a1210" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <g className="g-eyes">
            <ellipse cx="99" cy="74" rx="3.4" ry="4.2" fill="#0b1220" />
            <ellipse cx="121" cy="74" rx="3.4" ry="4.2" fill="#0b1220" />
            <circle cx="100.2" cy="72.6" r="1.1" fill="#fff" />
            <circle cx="122.2" cy="72.6" r="1.1" fill="#fff" />
          </g>
          <path d="M110 77 Q114 84 108.5 86" stroke={SKIN_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="92" cy="86" r="4.5" fill="#e07a5f" opacity="0.28" />
          <circle cx="128" cy="86" r="4.5" fill="#e07a5f" opacity="0.28" />
          <path d="M99 91 Q110 86 121 91 Q110 94.5 99 91 Z" fill="#1a1210" />
          <path d="M102 96 Q110 103 118 96" stroke="#3b1d12" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* hard hat */}
          <path d="M78 63 Q77 30 110 27 Q143 30 142 63 Z" fill={`url(#${hat})`} />
          <rect x="105" y="27" width="10" height="36" rx="4" fill="#ffd36e" opacity="0.75" />
          <path d="M70 62 Q110 54 150 62 Q151 69 145 69 L75 69 Q69 69 70 62 Z" fill="#d97706" />
          <path d="M86 40 Q92 33 100 31" stroke="#fff" strokeWidth="2.5" opacity="0.5" fill="none" strokeLinecap="round" />
        </g>

        {arm("l")}
        {arm("r")}
      </g>
    </svg>
  );
}

/** Small avatar (head only) for the floating widget */
export function GuideAvatar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="66 22 88 90" className={className} aria-hidden>
      <defs>
        <linearGradient id="av-hat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="0.45" stopColor="#f5a524" />
          <stop offset="1" stopColor="#c46a05" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="76" r="6.5" fill={SKIN_DARK} />
      <circle cx="140" cy="76" r="6.5" fill={SKIN_DARK} />
      <ellipse cx="110" cy="74" rx="30" ry="32" fill={SKIN} />
      <g className="g-eyes" style={{ transformBox: "view-box", transformOrigin: "110px 74px" }}>
        <ellipse cx="99" cy="74" rx="3.4" ry="4.2" fill="#0b1220" />
        <ellipse cx="121" cy="74" rx="3.4" ry="4.2" fill="#0b1220" />
      </g>
      <path d="M92 64 Q99 60 105 63" stroke="#1a1210" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M115 63 Q121 60 128 64" stroke="#1a1210" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M99 91 Q110 86 121 91 Q110 94.5 99 91 Z" fill="#1a1210" />
      <path d="M102 96 Q110 103 118 96" stroke="#3b1d12" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M78 63 Q77 30 110 27 Q143 30 142 63 Z" fill="url(#av-hat)" />
      <path d="M70 62 Q110 54 150 62 Q151 69 145 69 L75 69 Q69 69 70 62 Z" fill="#d97706" />
    </svg>
  );
}
