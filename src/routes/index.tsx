import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Hero } from "@/components/site/sections/Hero";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estação Aprender — Morumbi" },
      {
        name: "description",
        content:
          "Equipe multiprofissional especializada no cuidado integral de crianças e adolescentes.",
      },
      { property: "og:title", content: "Estação Aprender — Morumbi" },
      {
        property: "og:description",
        content:
          "Cuidando da saúde emocional de crianças, adolescentes e suas famílias com acolhimento e profissionalismo.",
      },
      {
        property: "og:image",
        content:
          "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <Hero />
        <DynamicSections paginaSlug="home" />
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
