// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const resend = new Resend(process.env.RESEND_API_KEY);

// Basit HTML escape
function esc(s: any) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function isEmail(x: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

export async function GET() {
  // Sağlık kontrolü – endpoint ayakta mı / env var mı?
  return NextResponse.json({
    ok: true,
    hasKey: !!process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM || "Sanal Kahve Falı <onboarding@resend.dev>",
    to: process.env.CONTACT_TO || "info@kahvefalin.com",
  });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const name = (body?.name || "").toString().trim();
  const email = (body?.email || "").toString().trim();
  const subject = (body?.subject || "").toString().trim() || "Yeni iletişim mesajı";
  const message = (body?.message || "").toString().trim();

  if (!name || !message) {
    return NextResponse.json({ error: "Ad ve mesaj zorunlu." }, { status: 400 });
  }
  if (email && !isEmail(email)) {
    return NextResponse.json({ error: "E-posta formatı geçersiz." }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "E-posta servisi yapılandırılmamış." }, { status: 503 });
  }

  const from = process.env.RESEND_FROM || "Sanal Kahve Falı <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO || "info@kahvefalin.com";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif">
      <h2>Yeni iletişim mesajı</h2>
      <p><b>Ad:</b> ${esc(name)}</p>
      ${email ? `<p><b>E-posta:</b> ${esc(email)}</p>` : ""}
      <p><b>Konu:</b> ${esc(subject)}</p>
      <hr/>
      <pre style="white-space:pre-wrap;line-height:1.5">${esc(message)}</pre>
    </div>
  `;
  const text = `Ad: ${name}\nE-posta: ${email || "-"}\nKonu: ${subject}\n\n${message}`;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);

    const result = await resend.emails.send({
      from, to, subject, html, text,
      reply_to: email || undefined,
      headers: { "X-Category": "contact" },
    });

    clearTimeout(t);

    if ((result as any)?.error) {
      throw new Error((result as any).error?.message || "E-posta gönderilemedi");
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Zaman aşımı. Lütfen tekrar deneyin." : (e?.message || "Gönderilemedi");
    console.error("CONTACT_ERROR:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
