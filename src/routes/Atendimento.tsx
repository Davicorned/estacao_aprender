import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { CTABanner } from "@/components/site/CTABanner";
import { Modalities } from "@/components/site/sections/atendimento/Modalities";
import { ProcessSteps } from "@/components/site/sections/atendimento/ProcessSteps";
import { SchedulingTimes } from "@/components/site/sections/atendimento/SchedulingTimes";

export const Route = createFileRoute("/Atendimento")({
  head: () => ({
    meta: [
      { title: "Atendimento — Espaço IDE Psicologia" },
      { name: "description", content: "Atendimento presencial e online. Conheça as etapas e prazos do nosso processo." },
      { property: "og:title", content: "Atendimento — Espaço IDE Psicologia" },
      { property: "og:description", content: "Escolha entre atendimento presencial ou online com agendamento em até 24h." },
    ],
  }),
  component: AtendimentoPage,
});

function AtendimentoPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageBanner
          eyebrow="Como funciona"
          title="Atendimento"
          description="Conheça como funciona nosso processo de atendimento e escolha a modalidade que melhor se adapta às suas necessidades."
        />
        <Modalities />
        <ProcessSteps />
        <SchedulingTimes />
        <CTABanner
          title="Pronto para dar o primeiro passo?"
          description="Entre em contato agora e agende sua consulta em até 24 horas."
          buttonLabel="Agendar consulta particular"
          href="https://wa.me/5511982556501?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Espa%C3%A7o%20IDE."
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}