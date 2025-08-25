import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const { name = "", email = "", message = "" } = (await req.json()) as Body;

    if (!name || !message) {
      return NextResponse.json({ ok: false, error: "Ad ve mesaj zorunludur." }, { status: 400 });
    }

    // --- SMTP VARSA ONU KULLAN ---
    const hasSmtp =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_PORT &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS;

    if (hasSmtp) {
      const secure = (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure,
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
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
    }

    // --- SMTP YOKSA HATA (istersen Resend fallback ekleriz) ---
    return NextResponse.json(
      { ok: false, error: "E-posta servisi yapılandırılmamış (SMTP_* env gerekli)." },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Mail gönderilemedi." },
      { status: 500 }
    );
  }
}

// Basit HTML kaçış
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
