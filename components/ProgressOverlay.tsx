"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  onDone: () => void;
  minMs?: number; // minimum bekleme (ms)
  maxMs?: number; // maksimum bekleme (ms)
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MESSAGES = [
  "Fotoğraflar yükleniyor…",
  "Falın okunuyor…",
  "Falcı yorumluyor…",
  "Detaylar yazıya dökülüyor…",
  "Enerjiler analiz ediliyor…",
  "Son dokunuşlar yapılıyor…",
];

export default function ProgressOverlay({ onDone, minMs = 20000, maxMs = 30000 }: Props) {
  const [percent, setPercent] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  // Toplam bekleme süresini bir kere belirle
  const total = useMemo(() => randInt(minMs, maxMs), [minMs, maxMs]);

  useEffect(() => {
    const start = performance.now();
    let rafId = 0;

    const tick = (t: number) => {
      const elapsed = t - start;
      // 0→1 arası ease-out ilerleme
      let p = Math.min(elapsed / total, 1);
      p = 1 - Math.pow(1 - p, 3);
      // Bitişe kadar %98'i geçme hissi ver
      const cap = elapsed < total ? 0.98 : 1;
      setPercent(Math.min(p, cap));

      if (elapsed >= total) {
        onDone();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 3200);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(msgTimer);
    };
  }, [onDone, total]);

  const pct = Math.round(percent * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="card w-[92%] max-w-md p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          <div className="text-sm font-medium text-neutral-900">{MESSAGES[msgIndex]}</div>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-neutral-900 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-2 text-right text-xs text-neutral-500">%{pct}</div>
      </div>
    </div>
  );
}
