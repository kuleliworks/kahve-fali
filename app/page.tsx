import StepForm from "@/components/StepForm";

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO (sade) */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Sanal Kahve Falı
        </h1>
        <p className="mt-4 text-neutral-600">
          Kahve fincanı fotoğraflarını yükle, adımlar arasında ilerle ve kişisel fal yorumunu hemen gör.
          Modern arayüz, hızlı deneyim ve çerezsiz akış.
        </p>
        <p className="mt-1 text-neutral-600">
          Süreç ortalama 20–30 saniye sürer ve sonucu paylaşabilirsin.
        </p>
      </div>

      {/* FORM */}
      <div id="form" className="mx-auto mt-10 max-w-3xl">
        <StepForm />
      </div>
    </section>
  );
}
