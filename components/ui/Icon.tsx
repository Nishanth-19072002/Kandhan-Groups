type IconName =
  | "factory" | "home" | "building" | "paint" | "pipe" | "bolt" | "hammer" | "drop"
  | "sofa" | "clipboard" | "compass" | "code" | "phone" | "mail" | "pin" | "clock"
  | "whatsapp" | "shield" | "rupee" | "user" | "check" | "calendar" | "layers" | "spark"
  | "arrow" | "close" | "menu" | "send" | "eye" | "hardhat" | "handshake" | "chart";

const paths: Record<IconName, React.ReactNode> = {
  factory: <><path d="M2 20V9l6 4V9l6 4V4h6v16H2z" /><path d="M7 17h2M12 17h2M17 17h1" /></>,
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  building: <><rect x="4" y="3" width="11" height="18" rx="1" /><path d="M15 9h5v12h-5" /><path d="M8 7h3M8 11h3M8 15h3" /></>,
  paint: <><rect x="3" y="3" width="15" height="6" rx="1.5" /><path d="M18 6h2v5h-8v3" /><rect x="10.5" y="14" width="3" height="7" rx="1" /></>,
  pipe: <><path d="M3 7h8a4 4 0 014 4v10" /><path d="M3 11h8v10" /><path d="M2 5v8M19 21h-8" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  hammer: <><path d="M14 4l6 6-3 3-6-6z" /><path d="M11 7L3 15l3 3 8-8" /></>,
  drop: <><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z" /><path d="M9 15a3 3 0 003 3" /></>,
  sofa: <><path d="M4 11V8a3 3 0 013-3h10a3 3 0 013 3v3" /><path d="M2 12a2 2 0 014 0v3h12v-3a2 2 0 014 0v6H2z" /><path d="M5 18v2M19 18v2" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 11l2 2 4-4M9 17h6" /></>,
  compass: <><circle cx="12" cy="5" r="2" /><path d="M11 7L5 21M13 7l6 14M7.5 15h9" /></>,
  code: <><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></>,
  phone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  pin: <><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  whatsapp: <><path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1.1z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 01-1.8-1.8l.8-1-1-2z" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  rupee: <><path d="M6 4h12M6 9h12M9 4c6 0 6 9 0 9H6l8 8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
  check: <path d="M4 12l5 5L20 6" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  spark: <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  send: <><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  hardhat: <><path d="M3 18h18" /><path d="M5 18v-3a7 7 0 0114 0v3" /><path d="M10 8V5h4v3" /></>,
  handshake: <><path d="M2 11l4-4 4 2 3-2 4 1 5 4" /><path d="M6 13l4 4a1.5 1.5 0 002-2l-1-1M13 15l2 2a1.5 1.5 0 002-2l-3-3" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 6-7" /></>,
};

export default function Icon({
  name,
  className = "w-6 h-6",
  strokeWidth = 1.7,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

export type { IconName };

