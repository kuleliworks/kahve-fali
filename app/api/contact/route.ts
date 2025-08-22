import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type Body = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  hp?: string; // honeypot
  kvkk?: boolean;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Body;

    // Honeypot: bot doldurursa görmezden gel (200 dönüp hiçbir şey yapma)
    if (data.hp) {
      return NextResponse.json({ ok: true });
    }

    // Basit doğrulama
    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const subject = (data.subject || "").trim();
    const message = (data.message || "").trim();
    const kvkk = !!data.kvkk;

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Zorunlu alanları doldurun." }, { status: 400 });
    }
    if (!kvkk) {
      return NextResponse.json({ ok: false, error: "KVKK onayı gerekli." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Geçerli bir e-posta girin." }, { status: 400 });
    }

    // SMTP konfigürasyonu ortam değişkenlerinden
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

    if (!host || !user || !pass) {
      return NextResponse.json(
        { ok: false, error: "Mail sunucusu yapılandırılmadı. (SMTP_HOST/PORT/USER/PASS)" },
        { status: 501 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const to = process.env.MAIL_TO || user;
    const from = process.env.MAIL_FROM || `Kahvefalin İletişim <no-reply@kahvefalin.com>`;

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <h2 style="margin:0 0 8px 0">Yeni iletişim mesajı</h2>
        <p><b>Ad Soyad:</b> ${escapeHtml(name)}</p>
        <p><b>E-posta:</b> ${escapeHtml(email)}</p>
        ${subject ? `<p><b>Konu:</b> ${escapeHtml(subject)}</p>` : ""}
        <p><b>Mesaj:</b></p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(message)}</pre>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: subject ? `İletişim: ${subject}` : "İletişim formu",
      html,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

// Basit HTML kaçış fonksiyonu
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
