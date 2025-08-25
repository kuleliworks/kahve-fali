import { NextResponse } from "next/server";
import { Resend } from "resend";

type Body = { name?: string; email?: string; message?: string };

function hasResend() {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: hasResend() ? "resend" : "missing",
    from: process.env.RESEND_FROM ? "set" : "missing",
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
    if (!hasResend()) {
      return NextResponse.json(
        { ok: false, error: "E-posta servisi yapılandırılmamış (RESEND_* env)." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const from = process.env.RESEND_FROM!;
    const to = process.env.CONTACT_TO || process.env.RESEND_TO || "info@kahvefalin.com";

    const subject = `İletişim Formu: ${name}`;

    const text = `Ad: ${name}
E-posta: ${email || "-"}
    
Mesaj:
${message}`;

    const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
  <h2>İletişim Formu</h2>
  <p><b>Ad:</b> ${esc(name)}</p>
  <p><b>E-posta:</b> ${email ? esc(email) : "-"}</p>
  <hr/>
  <pre style="white-space:pre-wrap;font:inherit">${esc(message)}</pre>
</div>`.trim();

    // Basit timeout: 15 sn içinde dönsün (serverless'ta asılı kalmasın)
    const ac = new AbortController();
    const killer = setTimeout(() => ac.abort(), 15000);

    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
      // not: reply-to istersen domain doğrulandıktan sonra ekleyebiliriz
    });

    clearTimeout(killer);

    if (error) throw new Error(String(error));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg =
      err?.name === "AbortError"
        ? "Zaman aşımı. Lütfen tekrar deneyin."
        : err?.message || "Mail gönderilemedi.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
