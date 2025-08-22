"use client";

import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <img src="/resim/sanal-kahve-fali-x2.png" alt="Logo" width={130} height={40} style={{ width: 110 }} />
        </a>

        {/* Desktop menu */}
        <nav className="hidden items-center gap-6 text-sm text-neutral-700 sm:flex">
          <a href="/" className="hover:text-neutral-900">Ana Sayfa</a>
          <a href="/blog" className="hover:text-neutral-900">Blog</a>
          <a href="/hakkimizda" className="hover:text-neutral-900">Hakkımızda</a>
          <a href="/iletisim" className="hover:text-neutral-900">İletişim</a>
          <a href="/#form" className="btn btn-primary">Fal Gönder</a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-neutral-200"
          aria-label="Menüyü aç/kapat"
          type="button"
        >
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden">
          <nav className="mx-4 mb-4 space-y-1 rounded-2xl bg-white p-3 shadow-md ring-1 ring-neutral-200">
            <a href="/" className="block rounded-lg px-3 py-2 hover:bg-neutral-50">Ana Sayfa</a>
            <a href="/blog" className="block rounded-lg px-3 py-2 hover:bg-neutral-50">Blog</a>
            <a href="/hakkimizda" className="block rounded-lg px-3 py-2 hover:bg-neutral-50">Hakkımızda</a>
            <a href="/iletisim" className="block rounded-lg px-3 py-2 hover:bg-neutral-50">İletişim</a>
            <a href="/#form" className="btn btn-primary mt-2 w-full">Fal Gönder</a>
          </nav>
        </div>
      )}
    </header>
  );
}
