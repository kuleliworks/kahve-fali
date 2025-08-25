// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // Nodemailer için edge değil, Node gereklidir.

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  try {
    const { name, email, message } = (await req.json().catch(() => ({}))) as Body;

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Lütfen tüm alanları doldurun." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ ok: false, error: "E-posta adresi geçersiz." }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `Sanal Kahve Falı <no-reply@${new URL(process.env.SITE_URL || "https://kahvefalin.com").hostname}>`;
    const to = process.env.CONTACT_TO || "info@kahvefalin.com";

    if (!host || !user || !pass) {
      // Sunucu yapılandırılmamışsa kullanıcıya kibar uyarı
      return NextResponse.json(
        { ok: false, error: "İletişim servisi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin." },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465: SSL, 587: STARTTLS
      auth: { user, pass },
    });

    const subject = `İletişim Formu: ${name}`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Robotto,Arial,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 12px">Yeni iletişim mesajı</h2>
        <p><strong>Ad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p style="white-space:pre-wrap"><strong>Mesaj:</strong><br/>${message.replace(/</g, "&lt;")}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <p style="color:#6b7280;font-size:12px">Bu e-posta kahvefalin.com iletişim formundan gönderildi.</p>
      </div>
    `;

    await transporter.sendMail({
      from,          // Kimlik doğrulanan domain ile eşleşmeli
      to,            // Hedef
      replyTo: email, // Müşteriye yanıtlamak için
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
