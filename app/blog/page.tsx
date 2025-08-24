import BlogListClient from "@/components/BlogListClient";

export const metadata = {
  title: "Blog",
  description: "Sanal Kahve Falı blog: ipuçları, rehberler ve duyurular.",
  alternates: { canonical: "/blog" },
};

export default function Page() {
  // (İstersen JSON-LD ekleyebilirsin, şart değil)
  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-stone-700">İpuçları, rehberler ve güncellemeler.</p>
      </div>

      {/* Listeyi client bileşen çeker */}
      <BlogListClient />
    </section>
  );
}
