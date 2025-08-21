import StepForm from "@/components/StepForm";

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Sanal Kahve Falı — online fal deneyimi
        </h1>
        <p className="mt-4 text-neutral-600">
          Fotoğraflarını yükle, adım adım ilerle ve modern arayüzde fal sonucunu gör. Hızlı, güvenli, çerezsiz.
        </p>
      </div>

      {/* Form */}
      <div id="form" className="mx-auto mt-10 max-w-3xl">
        <StepForm />
      </div>
    </section>
  );
}
