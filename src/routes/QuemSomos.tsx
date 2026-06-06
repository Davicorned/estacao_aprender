import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { CTABanner } from "@/components/site/CTABanner";
import { OurStory } from "@/components/site/sections/quemsomos/OurStory";
import { OurValues } from "@/components/site/sections/quemsomos/OurValues";
import { Founder } from "@/components/site/sections/quemsomos/Founder";

export const Route = createFileRoute("/QuemSomos")({
  head: () => ({
    meta: [
      { title: "Quem Somos — Espaço IDE Psicologia" },
      { name: "description", content: "Conheça a história, os valores e a equipe do Espaço IDE Psicologia." },
      { property: "og:title", content: "Quem Somos — Espaço IDE Psicologia" },
      { property: "og:description", content: "Cuidamos de cada fase do desenvolvimento do seu filho com uma equipe multidisciplinar." },
    ],
  }),
  component: QuemSomosPage,
});

function QuemSomosPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageBanner
          eyebrow="Sobre nós"
          title="Cuidamos de cada fase do desenvolvimento do seu filho"
          description="Com um olhar integrado, entendemos as necessidades do seu filho e direcionamos caminhos para o seu desenvolvimento."
        />
        <OurStory />
        <OurValues />
        <Founder />
        <CTABanner
          title="Vamos cuidar da sua família juntos?"
          description="Estamos prontos para ajudar você e seu filho a superar desafios e construir uma vida mais feliz e saudável."
          buttonLabel="Fale conosco"
          href="https://wa.me/5511966654857?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20mais%20sobre%20o%20Espa%C3%A7o%20IDE."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}