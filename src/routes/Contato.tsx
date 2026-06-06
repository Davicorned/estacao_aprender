import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { QuickChoiceCards } from "@/components/site/sections/contato/QuickChoiceCards";
import { Contact } from "@/components/site/sections/Contact";

export const Route = createFileRoute("/Contato")({
  head: () => ({
    meta: [
      { title: "Contato — Estação Aprender" },
      { name: "description", content: "Fale conosco pelo WhatsApp, e-mail ou visite uma de nossas unidades em São Paulo." },
      { property: "og:title", content: "Contato — Estação Aprender" },
      { property: "og:description", content: "Estamos prontos para ajudar você e sua família. Agende sua consulta." },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageBanner
          eyebrow="Fale conosco"
          title="Contato"
          description="Estamos prontos para ajudar você e sua família. Entre em contato e agende sua consulta."
        />
        <QuickChoiceCards />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}