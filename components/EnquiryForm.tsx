"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";
import GuideCharacter from "@/components/guide/GuideCharacter";
import { workTypes } from "@/lib/siteConfig";

type Status = "idle" | "sending" | "success" | "error";

export default function EnquiryForm({
  compact = false,
  presetWork,
}: {
  compact?: boolean;
  presetWork?: string;
}) {
  const [form, setForm] = useState({ name: "", workType: "", phone: "", email: "", message: "", company: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (presetWork) setForm((f) => ({ ...f, workType: presetWork }));
  }, [presetWork]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const [lastSent, setLastSent] = useState<{ name: string; workType: string; phone: string; email: string; message?: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name");
    if (!form.workType) return setError("Please select the type of work");
    if (!/^[+]?[\d\s-]{8,16}$/.test(form.phone.trim())) return setError("Please enter a valid phone number");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid email");

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong");
      setLastSent({ ...form });
      setStatus("success");
      setForm({ name: "", workType: "", phone: "", email: "", message: "", company: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const input =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-gold/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-gold/20";

  const options = presetWork && !workTypes.includes(presetWork as (typeof workTypes)[number]) ? [presetWork, ...workTypes] : workTypes;

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center py-4 text-center"
        >
          <GuideCharacter pose="thumbs" className={compact ? "w-24" : "w-32"} />
          <h4 className="mt-3 font-display text-xl font-bold text-white">Thank you! 🎉</h4>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Your enquiry has reached our team. We&apos;ll get back to you shortly.
          </p>

          {lastSent && (
            <a
              href={`https://wa.me/916363902388?text=${encodeURIComponent(
                `🏗️ *New Project Enquiry – Kandhan Groups*\n\n` +
                  `👤 *Name:* ${lastSent.name}\n` +
                  `🛠️ *Work:* ${lastSent.workType}\n` +
                  `📞 *Phone:* ${lastSent.phone}\n` +
                  `✉️ *Email:* ${lastSent.email}\n` +
                  `💬 *Notes:* ${lastSent.message || "-"}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="shine mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-ink shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition"
            >
              <Icon name="whatsapp" className="h-4 w-4" />
              Chat on WhatsApp Now →
            </a>
          )}

          <button onClick={() => setStatus("idle")} className="mt-4 text-xs font-semibold text-gold hover:underline">
            Send another enquiry
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3" noValidate>
          <div className={compact ? "space-y-3" : "grid gap-3 sm:grid-cols-2"}>
            <input className={input} placeholder="Your name *" value={form.name} onChange={set("name")} autoComplete="name" />
            <select className={`${input} appearance-none ${form.workType ? "" : "text-slate-500"}`} value={form.workType} onChange={set("workType")}>
              <option value="" disabled>
                Type of work *
              </option>
              {options.map((w) => (
                <option key={w} value={w} className="bg-panel text-white">
                  {w}
                </option>
              ))}
            </select>
            <input className={input} placeholder="Phone number *" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
            <input className={input} placeholder="Email address *" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          </div>
          <textarea
            className={`${input} resize-none`}
            rows={compact ? 2 : 4}
            placeholder="Tell us briefly about your project (optional)"
            value={form.message}
            onChange={set("message")}
          />
          {/* honeypot */}
          <input type="text" tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} className="hidden" aria-hidden />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="shine group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-deep px-6 py-3.5 font-semibold text-ink transition hover:brightness-110 disabled:opacity-70"
          >
            {status === "sending" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" /> Sending…
              </>
            ) : (
              <>
                Send Enquiry <Icon name="send" className="h-4 w-4 transition group-hover:translate-x-1" strokeWidth={2} />
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500">We respond within a few hours · Your details stay private</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

