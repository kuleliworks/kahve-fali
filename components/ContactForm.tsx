// components/ContactForm.tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!name || !email || !message) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ name, email, message }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Mesaj gönderilemedi.");
      }

      setOk(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Adın"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mt-4">
        <textarea
          className="input h-40"
          placeholder="Mesajın"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Gönderiliyor…" : "Gönder"}
        </button>
        {ok && <span className="text-sm text-green-600">Mesajın alındı, teşekkürler.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
