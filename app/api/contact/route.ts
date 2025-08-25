import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type Body = { name?: string; email?: string; message?: string };

function hasSmtp() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS
  );
}

// Basit durum kontrolü (gizli bilgileri dökmeden)
export async function GET() {
  return NextResponse.json({
    ok: true,
    smtpConfigured: hasSmtp(),
    host: process.env.SMTP_HOST ? "set" : "missing",
    user: process.env.SMTP_USER ? "set" : "missing",
  });
}

export async function POST(req: Request) {
  try {
    const { name = "", email = "", message = "" } = (await req.json()) as Body;

    if (!name || !message) {
      return NextResponse.json(
        { ok: false, error: "Ad ve mesaj zorunlu." },
        { status: 400 }
      );
    }

    if (!hasSmtp()) {
      return NextResponse.json(
        { ok: false, error: "E-posta servisi yapılandırılmamış (SMTP_* env)." },
        { status: 500 }
      );
    }

    const secure = (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure, // 465 -> true
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
      // Bağlantı beklemelerini kıs: uzun bekleyip formun takılmasını önler
      connectionTimeout: 8000, // ms
      socketTimeout: 12000,
      greetingTimeout: 8000,
    });

    const fromName = process.env.SMTP_FROM_NAME || "Sanal Kahve Falı";
    const from = `${fromName} <${process.env.SMTP_USER}>`;
    const to = process.env.CONTACT_TO || process.env.SMTP_USER!;

    await transporter.sendMail({
      from,
      to,
      subject: `İletişim Formu: ${name}`,
      replyTo: email || undefined,
      text: `Ad: ${name}\nE-posta: ${email || "-"}\n\nMesaj:\n${message}`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
          <h2>İletişim Formu</h2>
          <p><b>Ad:</b> ${escapeHtml(name)}</p>
          <p><b>E-posta:</b> ${email ? escapeHtml(email) : "-"}</p>
          <hr/>
          <pre style="white-space:pre-wrap;font:inherit">${escapeHtml(message)}</pre>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Hata olduğunda asla asılı kalma: JSON ile dön
    return NextResponse.json(
      { ok: false, error: err?.message || "Mail gönderilemedi." },
      { status: 500 }
    );
  }
}

// ES2019 uyumlu escape (replaceAll yok)
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
