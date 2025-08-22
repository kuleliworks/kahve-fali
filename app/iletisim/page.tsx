import type { Metadata } from "next";
import { SITE } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Soruların ve iş birlikleri için bize ulaş: info@kahvefalin.com",
  alternates: { canonical: "/iletisim" },
  openGraph: {
    url: "/iletisim",
    title: "İletişim",
    description: "Soruların ve iş birlikleri için bize ulaş.",
    images: [{ url: "/resim/sanal-kahve-fali-x2.png" }],
  },
  twitter: {
    title: "İletişim",
    description: "Soruların ve iş birlikleri için bize ulaş.",
    images: ["/resim/sanal-kahve-fali-x2.png"],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE.url}/iletisim`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name, // "Sanal Kahve Falı"
      url: SITE.url,
      logo: `${SITE.url}/resim/sanal-kahve-fali-x2.png`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "info@kahvefalin.com",
          availableLanguage: ["tr-TR", "en"],
        },
      ],
      sameAs: [SITE.url],
    },
    description:
      "Sanal Kahve Falı ile iletişim: Sorular ve iş birliği için e-posta ya da form üzerinden ulaşın.",
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
        İletişim
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-stone-700">
        Soruların ve iş birlikleri için formu doldurabilir ya da{" "}
        <a
          className="underline underline-offset-4"
          href="mailto:info@kahvefalin.com"
        >
          info@kahvefalin.com
        </a>{" "}
        adresine e-posta gönderebilirsin.
      </p>

      <ContactForm />

      <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        <a href="mailto:info@kahvefalin.com" className="k-card flex items-center gap-3">
          <i className="fa-regular fa-envelope text-indigo-700" /> info@kahvefalin.com
        </a>
        <a href="/#form" className="k-card flex items-center gap-3">
          <i className="fa-solid fa-mug-saucer text-indigo-700" /> Falını hemen gönder
        </a>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
