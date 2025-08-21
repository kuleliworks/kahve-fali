"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  id: string;
  title: string; // paylaşım metninde kullanacağız
};

export default function ShareButtons({ id, title }: Props) {
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const url = useMemo(() => (origin ? `${origin}/fal/${id}` : `https://kahvefalin.com/fal/${id}`), [origin, id]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Bağlantı kopyalandı!");
    } catch {
      alert(url);
    }
  };

  const onNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      onCopy();
    }
  };

  const text = `${title} – ${url}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={onNativeShare} className="btn btn-primary" type="button">
        <i className="fa-solid fa-share-nodes mr-2" /> Paylaş
      </button>

      <a
        className="btn btn-ghost"
        href={`https://x.com/intent/post?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-x-twitter mr-2" /> X
      </a>

      <a
        className="btn btn-ghost"
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-whatsapp mr-2" /> WhatsApp
      </a>

      <a
        className="btn btn-ghost"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-facebook mr-2" /> Facebook
      </a>

      <button onClick={onCopy} className="btn btn-ghost" type="button">
        <i className="fa-regular fa-copy mr-2" /> Kopyala
      </button>
    </div>
  );
}
