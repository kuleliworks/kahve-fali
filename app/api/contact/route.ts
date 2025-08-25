// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "edge"; // HTTP API, Edge'te hızlı çalışır

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

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "E-posta servisi yapılandırılmamış." }, { status: 503 });
    }

    const resend = new Resend(apiKey);

    // From: domain doğrulaması yaptıysanız kendi adresinizi kullanın.
    // İlk test için 'onboarding@resend.dev' çalışır.
    const from =
      process.env.RESEND_FROM ||
      "Sanal Kahve Falı <onboarding@resend.dev>";

    const to = process.env.CONTACT_TO || "info@kahvefalin.com";
    const subject = `İletişim Formu: ${name}`;

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Robotto,Arial,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 12px">Yeni iletişim mesajı</h2>
        <p><strong>Ad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p style="white-space:pre-wrap"><strong>Mesaj:</strong><br/>${(message || "").replace(/</g,"&lt;")}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <p style="color:#6b7280;font-size:12px">Bu e-posta kahvefalin.com iletişim formundan gönderildi.</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from,
      to: [to],
      reply_to: email,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message || "Gönderilemedi." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Beklenmeyen bir hata." },
      { status: 500 }
    );
  }
}
