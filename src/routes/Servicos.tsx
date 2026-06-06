import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MessageCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { ServicesAccordion } from "@/components/site/sections/servicos/ServicesAccordion";
import { FadeUp } from "@/components/site/FadeUp";

const WA = "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20do%20Esta%C3%A7%C3%A3o%20Aprender.";

export const Route = createFileRoute("/Servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Estação Aprender" },
      { name: "description", content: "Psicoterapia, Avaliação Neuropsicológica, Fonoaudiologia e Psicopedagogia para crianças e adolescentes." },
      { property: "og:title", content: "Serviços — Estação Aprender" },
      { property: "og:description", content: "Reunimos diferentes especialidades para cuidar do desenvolvimento de crianças e adolescentes." },
    ],
  }),
  component: ServicosPage,
});

function ServicosPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageBanner
          eyebrow="Especialidades"
          title="Serviços"
          description="Reunimos diferentes especialidades para cuidar do desenvolvimento de crianças e adolescentes de forma personalizada."
          extra={
            <div className="flex flex-wrap items-center gap-4">
              <a
                id="whatsapp_start"
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-6 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E]"
              >
                <Calendar className="h-4 w-4" />
                Agendar atendimento
              </a>
            </div>
          }
        />
        <ServicesAccordion />

        {/* CTA final */}
        <section className="bg-gray-50 py-16">
          <FadeUp className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Não sabe qual serviço é ideal para seu filho?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Entre em contato conosco para uma avaliação inicial. Nossa equipe irá orientar você
              sobre a melhor abordagem terapêutica.
            </p>
            <a
              id="whatsapp_start"
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-7 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E]"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com especialista
            </a>
          </FadeUp>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}