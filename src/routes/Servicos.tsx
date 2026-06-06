import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle2, MessageCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { ServicesAccordion } from "@/components/site/sections/servicos/ServicesAccordion";
import { FadeUp } from "@/components/site/FadeUp";

const WA = "https://wa.me/5511966654857?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20do%20Espa%C3%A7o%20IDE.";

export const Route = createFileRoute("/Servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Espaço IDE Psicologia" },
      { name: "description", content: "Psicoterapia, Avaliação Neuropsicológica, Fonoaudiologia e Psicopedagogia para crianças e adolescentes." },
      { property: "og:title", content: "Serviços — Espaço IDE Psicologia" },
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-pink-600"
              >
                <Calendar className="h-4 w-4" />
                Agendar atendimento
              </a>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow">
                <CheckCircle2 className="h-4 w-4 text-rose-500" />
                Particular em até 24h
              </div>
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
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-7 text-sm font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-pink-600"
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