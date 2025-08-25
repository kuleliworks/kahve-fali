"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErr(null);

    // 18 sn sonra vazgeç (sunucu beklerse buton takılı kalmasın)
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 18000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({ name, email, message }),
      });

      clearTimeout(t);

      // Yanıt JSON değilse bile takılma
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        /* noop */
      }

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Sunucu hatası (${res.status})`);
      }

      setOk(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (e: any) {
      setOk(false);
      setErr(e?.name === "AbortError" ? "Zaman aşımı. Lütfen tekrar deneyin." : (e?.message || "Gönderilemedi."));
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Adın *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="E-posta (opsiyonel)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <textarea
        className="input h-40"
        placeholder="Mesajın *"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Gönderiliyor…" : "Gönder"}
        </button>

        {ok && <span className="text-green-600 text-sm">Mesajın alındı. Teşekkürler!</span>}
        {ok === false && <span className="text-red-600 text-sm">{err}</span>}
      </div>
    </form>
  );
}
