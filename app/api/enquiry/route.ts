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

  const items = [
    { label: "Client Name", val: d.name, highlight: false },
    { label: "Type of Work", val: d.workType, highlight: true },
    { label: "Phone Number", val: d.phone, highlight: false },
    { label: "Email Address", val: d.email, highlight: false },
    { label: "Project Notes", val: d.message || "No additional notes provided", highlight: false },
  ];

  const cardsHtml = items
    .map(
      (item) => `
      <div style="padding:14px 18px;border-bottom:1px solid #1e293b;background:#0f172a">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#f5a524">${esc(item.label)}</div>
        <div style="font-size:15px;font-weight:600;color:${item.highlight ? '#f5a524' : '#f8fafc'};margin-top:4px;word-break:break-word;overflow-wrap:anywhere;line-height:1.4">${esc(item.val)}</div>
      </div>`
    )
    .join("");

  const cleanDigits = d.phone.replace(/[^\d]/g, "");

  const html = `
  <div style="background:#070b14;padding:16px 8px;font-family:Segoe UI,Roboto,-apple-system,Arial,sans-serif;-webkit-text-size-adjust:100%">
    <div style="max-width:540px;margin:0 auto;background:#0f172a;border:1px solid #f5a52455;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.6)">
      
      <!-- Brand Header -->
      <div style="padding:22px 20px;background:linear-gradient(135deg,#f5a524,#d97706);color:#070b14">
        <div style="font-size:10px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase">NEW CLIENT ENQUIRY</div>
        <div style="font-size:22px;font-weight:800;margin-top:3px;line-height:1.2">${esc(siteConfig.name)}</div>
        <div style="font-size:12px;opacity:0.9;margin-top:2px">Bengaluru &amp; South India Operations</div>
      </div>

      <!-- Detail Cards (Stacked for 100% Mobile & Desktop Responsiveness) -->
      <div>${cardsHtml}</div>

      <!-- Action Buttons -->
      <div style="padding:18px;background:#0b1220;text-align:center">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:4px">
              <a href="tel:${esc(d.phone)}" style="display:block;background:#f5a524;color:#070b14;padding:12px 14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;text-align:center;box-sizing:border-box">📞 Call Client</a>
            </td>
            <td style="padding:4px">
              <a href="https://wa.me/${cleanDigits}" style="display:block;background:#22c55e;color:#070b14;padding:12px 14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;text-align:center;box-sizing:border-box">💬 WhatsApp</a>
            </td>
          </tr>
        </table>
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

/* Send instant Telegram alert to both phones / chat IDs */
async function sendTelegramAlert(d: Enquiry) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const chatIds: string[] = [];
  if (process.env.TELEGRAM_CHAT_ID) {
    chatIds.push(...process.env.TELEGRAM_CHAT_ID.split(",").map((s) => s.trim()));
  }
  if (process.env.TELEGRAM_CHAT_ID_1) chatIds.push(process.env.TELEGRAM_CHAT_ID_1.trim());
  if (process.env.TELEGRAM_CHAT_ID_2) chatIds.push(process.env.TELEGRAM_CHAT_ID_2.trim());

  const uniqueChats = Array.from(new Set(chatIds.filter(Boolean)));
  if (uniqueChats.length === 0) return false;

  const text =
    `🏗️ *New Project Enquiry – ${siteConfig.name}*\n\n` +
    `👤 *Client Name:* ${d.name}\n` +
    `🛠️ *Work Type:* ${d.workType}\n` +
    `📞 *Phone:* ${d.phone}\n` +
    `✉️ *Email:* ${d.email}\n` +
    `💬 *Notes:* ${d.message || "-"}\n\n` +
    `_Received via Kandhan Groups Website_`;

  for (const chatId of uniqueChats) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      });
    } catch (err) {
      console.error(`[telegram send error ${chatId}]`, err);
    }
  }
  return true;
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
  if (targets.length === 0 && process.env.CALLMEBOT_APIKEY) {
    targets.push({ phone: process.env.WHATSAPP_PHONE || "916363902388", key: process.env.CALLMEBOT_APIKEY });
  }

  // Dispatch email, Telegram, and WhatsApp in parallel
  const tasks: Promise<unknown>[] = [];

  tasks.push(sendEmail(d).catch((e) => console.error("[email error]", e)));
  tasks.push(sendTelegramAlert(d).catch((e) => console.error("[telegram error]", e)));

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
