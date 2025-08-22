"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressOverlay from "./ProgressOverlay";

type Gender = "kadin" | "erkek" | "belirtmek-istemiyorum";

type StepData = {
  name?: string;
  gender?: Gender;
  age?: number;
  photos?: File[];
};

async function filesToBase64(files: File[] = []): Promise<string[]> {
  const to64 = (f: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });
  return Promise.all(files.map(to64));
}

export default function StepForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StepData>({});
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const canNext = useMemo(() => {
    if (step === 0) return !!data.name && (data.photos?.length || 0) > 0;
    if (step === 1) return !!data.gender;
    if (step === 2) return typeof data.age === "number" && (data.age ?? 0) > 0;
    return false;
  }, [data, step]);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 3);
    setData((d) => ({ ...d, photos: list }));
  }, []);

  const startFortune = () => {
    setError(null);
    setShowProgress(true);
  };

  const onProgressDone = useCallback(async () => {
    try {
      const photos64 = await filesToBase64(data.photos || []);
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          name: data.name,
          gender: data.gender,
          age: data.age,
          photos: photos64,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.id) {
        router.push(`/fal/${json.id}`);
        return;
      }
      throw new Error(json?.error || "Fal servisi henüz hazır değil.");
    } catch (e: any) {
      setError(e?.message || "Fal oluşturulurken bir hata oluştu.");
    } finally {
      setShowProgress(false);
    }
  }, [data, router]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md md:p-8">
      {/* Başlık */}
      <div className="mb-6 text-center">
        <div className="text-xl font-semibold">Falını Gönder</div>
        <div className="mt-1 text-sm text-neutral-500">
          Adını yaz, kahve fincanı fotoğraflarını yükle ve adımları tamamla.
        </div>
      </div>

      {/* Step göstergesi */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`step-dot ${i <= step ? "active" : ""}`} />
        ))}
      </div>

      {/* STEPS */}
      <>
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="input"
                placeholder="Adın (zorunlu)"
                value={data.name ?? ""}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                autoFocus
              />

              {/* Dosya alanını sade ve net yapalım */}
              <div>
                <input
                  id="photos"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <label
                  htmlFor="photos"
                  className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <i className="fa-regular fa-image mr-2" />
                  Kahve fincanı fotoğraflarını seç (en fazla 3)
                </label>
              </div>
            </div>

            {!!data.photos?.length && (
              <div className="grid grid-cols-3 gap-3">
                {data.photos.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <div key={i} className="overflow-hidden rounded-xl ring-1 ring-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`foto-${i + 1}`} className="h-28 w-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-neutral-500">
              Net, iyi ışıkta çekilmiş fincan/kapat fotoğrafları önerilir. Çerez kullanılmaz.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-lg font-semibold">Cinsiyet</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["kadin", "erkek", "belirtmek-istemiyorum"] as Gender[]).map((g) => (
                <button
                  key={g}
                  className={`btn ${data.gender === g ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setData((d) => ({ ...d, gender: g }))}
                  type="button"
                >
                  {g === "kadin" ? "Kadın" : g === "erkek" ? "Erkek" : "Belirtmek istemiyorum"}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-lg font-semibold">Yaş</div>
            <input
              className="input"
              type="number"
              min={12}
              max={99}
              placeholder="Örn: 27"
              value={data.age ?? ""}
              onChange={(e) => setData((d) => ({ ...d, age: Number(e.target.value || 0) }))}
            />
          </div>
        )}

        {/* Navigasyon */}
        <div className="mt-6 flex items-center justify-between">
          <button
            className="btn btn-ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            type="button"
          >
            Geri
          </button>

          {step < 2 ? (
            <button
              className="btn btn-primary"
              onClick={() => canNext && setStep((s) => Math.min(2, s + 1))}
              disabled={!canNext}
              type="button"
            >
              İleri
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={startFortune}
              disabled={!canNext}
              type="button"
            >
              Falı Başlat
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </>

      {showProgress && <ProgressOverlay onDone={onProgressDone} minMs={20000} maxMs={30000} />}
    </div>
  );
}
// Log yaz (bekletmeden)
fetch("/api/fal-log", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name,                      // formdan
    age,                       // formdan
    gender,                    // formdan
    photosCount: photos?.length || 0,
    readingId,                 // oluşturduğun id
    notes: intent || ""
  }),
}).catch(() => { /* sessizce yut */ });

// sonra sonuç sayfasına yönlendir
router.push(`/fal/${encodeURIComponent(readingId)}`);
