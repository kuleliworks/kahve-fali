import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Soruların ve iş birlikleri için bize ulaş.",
  alternates: { canonical: "/iletisim" },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center">İletişim</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-stone-700">
        Soruların ve iş birlikleri için formu doldurabilir ya da{" "}
        <a className="underline underline-offset-4" href="mailto:info@kahvefalin.com">info@kahvefalin.com</a>{" "}
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
    </section>
  );
}
