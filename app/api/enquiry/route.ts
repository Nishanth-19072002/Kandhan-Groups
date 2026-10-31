import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { enquirySchema, type Enquiry } from "@/lib/validation";
import { siteConfig } from "@/lib/siteConfig";

export const runtime = "nodejs";

/* In-memory rate limiter */
const hits = new Map<string, { count: number; ts: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.ts > 60_000) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* Send email to both inboxes */
async function sendEmail(d: Enquiry) {
  const user = process.env.GMAIL_USER || siteConfig.contact.emails[0];
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[email] GMAIL_APP_PASSWORD not set in environment.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const rows = [
    ["Client Name", d.name],
    ["Type of Work", d.workType],
    ["Phone Number", d.phone],
    ["Email Address", d.email],
    ["Project Notes", d.message || "—"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 14px;color:#94a3b8;font-size:13px;border-bottom:1px solid #1e293b;width:140px">${k}</td><td style="padding:10px 14px;color:#f8fafc;font-size:15px;border-bottom:1px solid #1e293b;font-weight:600">${esc(
          v!
        )}</td></tr>`
    )
    .join("");

  const html = `
  <div style="background:#070b14;padding:32px 16px;font-family:Segoe UI,Arial,sans-serif">
    <div style="max-width:580px;margin:auto;background:#0f172a;border:1px solid #f5a52444;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5)">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#f5a524,#d97706);color:#070b14">
        <div style="font-size:11px;letter-spacing:3px;font-weight:800;text-transform:uppercase">NEW CLIENT ENQUIRY</div>
        <div style="font-size:24px;font-weight:800;margin-top:4px">${esc(siteConfig.name)}</div>
        <div style="font-size:12px;opacity:0.85">Bengaluru & South India Operations</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:8px">${rows}</table>
      <div style="padding:22px 28px;background:#0b1220;border-top:1px solid #1e293b">
        <a href="tel:${esc(d.phone)}" style="display:inline-block;background:#f5a524;color:#070b14;padding:11px 20px;border-radius:999px;text-decoration:none;font-weight:700;margin-right:10px;font-size:13px">Call Client</a>
        <a href="https://wa.me/${d.phone.replace(/[^\d]/g, "")}" style="display:inline-block;background:#22c55e;color:#070b14;padding:11px 20px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px">Open in WhatsApp</a>
      </div>
    </div>
  </div>`;

  // Delivers to BOTH emails
  const recipients = process.env.ENQUIRY_TO_EMAIL || siteConfig.contact.emails.join(", ");

  await transporter.sendMail({
    from: `"${siteConfig.name} System" <${user}>`,
    to: recipients,
    replyTo: d.email,
    subject: `🏗️ New Project Enquiry: ${d.workType} — ${d.name}`,
    html,
    text: `New Enquiry\nName: ${d.name}\nWork: ${d.workType}\nPhone: ${d.phone}\nEmail: ${d.email}\nMessage: ${d.message || "-"}`,
  });
  return true;
}

/* Send WhatsApp notification to CallMeBot targets */
async function sendWhatsAppTo(phone: string, apikey: string, d: Enquiry) {
  const text =
    `🏗️ *New Project Enquiry – ${siteConfig.name}*\n\n` +
    `👤 *Client:* ${d.name}\n` +
    `🛠️ *Work Type:* ${d.workType}\n` +
    `📞 *Phone:* ${d.phone}\n` +
    `✉️ *Email:* ${d.email}\n` +
    `💬 *Notes:* ${d.message || "-"}\n\n` +
    `_Received via Kandhan Groups Website_`;

  const cleanPhone = phone.replace(/[^\d]/g, "");
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`CallMeBot HTTP ${res.status} for ${phone}`);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON format" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || "Invalid form data" },
      { status: 400 }
    );
  }

  // Honeypot check
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const d = parsed.data;
  console.log(`[enquiry received] ${d.name} (${d.phone}, ${d.email}) -> ${d.workType}`);

  // Collect WhatsApp targets for BOTH numbers
  const targets: { phone: string; key: string }[] = [];
  if (process.env.CALLMEBOT_APIKEY_1) {
    targets.push({ phone: process.env.WHATSAPP_PHONE_1 || "916363902388", key: process.env.CALLMEBOT_APIKEY_1 });
  }
  if (process.env.CALLMEBOT_APIKEY_2) {
    targets.push({ phone: process.env.WHATSAPP_PHONE_2 || "917795833418", key: process.env.CALLMEBOT_APIKEY_2 });
  }
  // Fallback to legacy single key if defined
  if (targets.length === 0 && process.env.CALLMEBOT_APIKEY) {
    targets.push({ phone: process.env.WHATSAPP_PHONE || "916363902388", key: process.env.CALLMEBOT_APIKEY });
  }

  // Dispatch email & WhatsApp in parallel
  const tasks: Promise<unknown>[] = [];

  tasks.push(sendEmail(d).catch((e) => console.error("[email error]", e)));

  for (const t of targets) {
    tasks.push(sendWhatsAppTo(t.phone, t.key, d).catch((e) => console.error(`[whatsapp error ${t.phone}]`, e)));
  }

  await Promise.allSettled(tasks);

  // Return success smoothly so client always gets visual confirmation
  return NextResponse.json({
    ok: true,
    message: "Enquiry successfully processed.",
  });
}
