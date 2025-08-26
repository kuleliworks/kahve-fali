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

// --- Upload guard (güncel) ---
const MAX_FILES = 3;                 // en fazla 3 fotoğraf
const MAX_ORIGINAL_MB = 30;          // tek dosya orijinal üst sınır (iPhone büyükler için geniş)
const TOTAL_MAX_MB = 45;             // toplam üst sınır (orijinal)
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"
];

// --- Sıkıştırma hedefleri ---
const TARGET_MAX_SIDE = 2000;        // en uzun kenarı 2000px'e indir
const TARGET_QUALITY_PRIMARY = 0.82; // ilk deneme kalite
const TARGET_QUALITY_FALLBACK = 0.7; // yetmezse ikinci deneme
const TARGET_MAX_MB_AFTER = 2.5;     // hedef dosya boyutu (~MB) sıkıştırma sonrası

function bytesToMB(b: number) { return b / (1024 * 1024); }

async function canDecodeViaBitmap(file: File) {
  try {
    const bmp = await createImageBitmap(file);
    bmp.close();
    return true;
  } catch {
    return false;
  }
}

async function readToBitmap(file: File): Promise<ImageBitmap> {
  // Safari/Chrome modern: createImageBitmap hızlı ve EXIF’i dikkate alır
  return await createImageBitmap(file);
}

function drawToCanvas(bmp: ImageBitmap, maxSide: number): HTMLCanvasElement {
  const { width, height } = bmp;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas;
}

async function canvasToBlobWithBudget(
  canvas: HTMLCanvasElement,
  targetMB: number,
  primaryQuality = TARGET_QUALITY_PRIMARY,
  fallbackQuality = TARGET_QUALITY_FALLBACK,
  mime = "image/jpeg"
): Promise<Blob> {
  // önce primaryQuality deneriz, hedefe sığmıyorsa fallback
  const blob1: Blob = await new Promise(res => canvas.toBlob(b => res(b!), mime, primaryQuality));
  if (bytesToMB(blob1.size) <= targetMB) return blob1;

  const blob2: Blob = await new Promise(res => canvas.toBlob(b => res(b!), mime, fallbackQuality));
  return blob2; // 2. deneme; hala büyükse yine de kabul (server tarafında tekrar kısıtlayabilirsin)
}

async function compressImageSmart(file: File): Promise<File> {
  // HEIC/HEIF bazı tarayıcılarda decode edilemez; decode edilemiyorsa orijinali bırakırız
  const type = file.type || "application/octet-stream";
  const canDecode = await canDecodeViaBitmap(file);

  if (!canDecode) {
    // decode edemiyorsak kullanıcı genelde Safari’dedir (HEIC destekli),
    // Chrome’da ise orijinal kalır (büyük olabilir) — uyarıyı onFiles içinde veriyoruz.
    return file;
  }

  const bmp = await readToBitmap(file);
  const canvas = drawToCanvas(bmp, TARGET_MAX_SIDE);
  bmp.close();
  const blob = await canvasToBlobWithBudget(canvas, TARGET_MAX_MB_AFTER);
  const out = new File([blob], file.name.replace(/\.(heic|heif|png|webp)$/i, ".jpg"), { type: "image/jpeg" });
  return out;
}




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

const onFiles = useCallback(async (files: FileList | null) => {
  if (!files) return;

  const picked = Array.from(files);
  const limited = picked.slice(0, MAX_FILES);

  const valid: File[] = [];
  const errors: string[] = [];
  let totalOriginal = 0;

  for (const f of limited) {
    // Tür
    if (!ALLOWED_TYPES.includes(f.type)) {
      errors.push(`${f.name}: desteklenmeyen format (${f.type || "bilinmiyor"})`);
      continue;
    }

    totalOriginal += f.size;

    // Tek dosya orijinal üst sınır (30MB)
    if (bytesToMB(f.size) > MAX_ORIGINAL_MB) {
      errors.push(`${f.name}: ${bytesToMB(f.size).toFixed(1)}MB > ${MAX_ORIGINAL_MB}MB orijinal limit`);
      continue;
    }

    // Sıkıştır
    let out = f;
    try {
      out = await compressImageSmart(f);
    } catch {
      // sıkıştırma başarısızsa orijinali bırak
      out = f;
    }

    valid.push(out);
  }

  // Toplam orijinal limit kontrolü (45MB)
  if (bytesToMB(totalOriginal) > TOTAL_MAX_MB) {
    errors.push(`Toplam orijinal boyut ${bytesToMB(totalOriginal).toFixed(1)}MB — en fazla ${TOTAL_MAX_MB}MB olmalı.`);
  }

  // HEIC/HEIF ve decode uyarısı (Chrome gibi tarayıcılar)
  const hasHeic = limited.some(f => /image\/hei[cf]/i.test(f.type));
  if (hasHeic) {
    const anyDecoded = await canDecodeViaBitmap(limited[0]).catch(() => false);
    if (!anyDecoded) {
      errors.push("HEIC/HEIF formatı tarayıcında dönüştürülemiyor olabilir. Lütfen JPEG/PNG kullan veya iPhone ayarlarından “En Uyumlu” seç.");
    }
  }

  if (errors.length) alert(errors.join("\n"));
  if (!valid.length || errors.length) return;

  setData((d) => ({ ...d, photos: valid }));
}, []);


  const startFortune = () => {
    setError(null);
    setShowProgress(true);
  };

  // Log API'si: bekletmeden kayıt düşer (panel için)
  async function logFalSubmission(args: {
    name: string;
    age: string | number;
    gender: string;
    photosCount: number;
    readingId: string;
    notes?: string;
  }) {
    try {
      await fetch("/api/fal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
    } catch {
      // sessizce yut
    }
  }

  const onProgressDone = useCallback(async () => {
    try {
      const photosCount = data.photos?.length || 0; // sadece sayı
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          name: data.name,
          gender: data.gender,
          age: data.age,
          photosCount, // <-- sadece sayı gönderiyoruz
        }),
      });


      const json = await res.json().catch(() => ({} as any));
      if (res.ok && json?.id) {
        // Panel kaydı için log at (await etmeden)
        logFalSubmission({
          name: String(data.name || ""),
          age: data.age ?? "",
          gender: String(data.gender || ""),
          photosCount: data.photos?.length ?? 0,
          readingId: String(json.id),
          notes: "", // şu an niyet alanı yok; eklersen buraya geçir
        });

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

              {/* Dosya alanı */}
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
