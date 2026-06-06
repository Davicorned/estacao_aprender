import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { ConvenioBanner } from "@/components/site/sections/convenio/ConvenioBanner";
import { AmberNotice } from "@/components/site/sections/convenio/AmberNotice";
import { ConvenioFlow } from "@/components/site/sections/convenio/ConvenioFlow";
import { ConvenioForm } from "@/components/site/sections/convenio/ConvenioForm";

export const Route = createFileRoute("/Convenio")({
  head: () => ({
    meta: [
      { title: "Atendimento por Convênio — Estação Aprender" },
      {
        name: "description",
        content:
          "Solicite atendimento via convênio. Validamos a elegibilidade do seu plano e agendamos sua consulta.",
      },
      { property: "og:title", content: "Atendimento por Convênio — Estação Aprender" },
      {
        property: "og:description",
        content:
          "Deixe seus dados e nossa equipe entrará em contato para verificar a elegibilidade do seu plano.",
      },
    ],
  }),
  component: ConvenioPage,
});

function ConvenioPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <ConvenioBanner />
        <AmberNotice />
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <ConvenioFlow />
              <ConvenioForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}