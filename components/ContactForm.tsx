"use client";
import { useState } from "react";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setOk(null);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        kvkk: payload.kvkk === "on",
        hp: payload.hp, // honeypot
      }),
    });

    const json = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (res.ok && json?.ok) {
      setOk(true);
      e.currentTarget.reset();
    } else {
      setOk(false);
      setErr(json?.error || "Gönderilemedi. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-md md:p-8">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Honeypot */}
        <input type="text" name="hp" autoComplete="off" className="hidden" tabIndex={-1} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700">Ad Soyad *</label>
            <input name="name" required placeholder="Adın Soyadın" className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">E-posta *</label>
            <input name="email" type="email" required placeholder="ornek@eposta.com" className="input mt-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Konu</label>
          <input name="subject" placeholder="(Opsiyonel)" className="input mt-1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Mesaj *</label>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Bize iletmek istediklerin..."
            className="input mt-1 min-h-[140px]"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-stone-600">
          <input type="checkbox" name="kvkk" className="mt-1" required /> KVKK bilgilendirmesini okudum ve onaylıyorum.
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="reset" className="btn btn-ghost">Temizle</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>

        {ok && <p className="text-sm text-green-600">Teşekkürler! Mesajını aldık.</p>}
        {ok === false && err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </div>
  );
}
