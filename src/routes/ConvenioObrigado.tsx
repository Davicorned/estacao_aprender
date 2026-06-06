import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

export const Route = createFileRoute("/ConvenioObrigado")({
  head: () => ({
    meta: [
      { title: "Solicitação recebida — Espaço IDE Psicologia" },
      {
        name: "description",
        content: "Recebemos sua solicitação de atendimento via convênio. Em breve entraremos em contato.",
      },
    ],
  }),
  component: ConvenioObrigadoPage,
});

function ConvenioObrigadoPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main className="bg-gradient-to-br from-cyan-50 to-blue-50 py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
            <CheckCircle2 className="h-8 w-8 text-cyan-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Recebemos sua solicitação!</h1>
          <p className="mt-4 text-lg text-gray-600">
            Nossa equipe vai verificar a elegibilidade do seu plano e retornará em até 2 dias
            úteis com orientações e opções de agendamento.
          </p>
          <Link
            to="/Particular"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-600"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}