"use client";
import { useEffect, useState } from "react";

/** Types a list of lines one after another, keeping the last one visible */
export default function Typewriter({
  lines,
  start = true,
  speed = 38,
  pause = 1100,
  onDone,
  className = "",
}: {
  lines: string[];
  start?: boolean;
  speed?: number;
  pause?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!start) return;
    const full = lines[lineIdx];
    if (text.length < full.length) {
      const t = setTimeout(() => setText(full.slice(0, text.length + 1)), speed);
      return () => clearTimeout(t);
    }
    if (lineIdx < lines.length - 1) {
      const t = setTimeout(() => {
        setLineIdx((i) => i + 1);
        setText("");
      }, pause);
      return () => clearTimeout(t);
    }
    onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, text, lineIdx]);

  return (
    <span className={className}>
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-gold" />
    </span>
  );
}

