import { Phone, Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "../../FadeUp";

const WA = "https://wa.me/5511966654857?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20particular%20no%20Espa%C3%A7o%20IDE.";

export function QuickChoiceCards() {
  return (
    <section className="border-b border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Particular */}
          <FadeUp>
            <div className="rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-6 shadow">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-rose-500 text-white hover:bg-rose-500">Até 24h</Badge>
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">Consulta Particular</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Atendimento rápido via WhatsApp. Agende sua consulta e seja atendido em até 24 horas.
              </p>
              <a
                id="whatsapp_start"
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                Chamar no WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </FadeUp>

          {/* Convênio */}
          <FadeUp delay={0.1}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100">
                  <Shield className="h-7 w-7 text-cyan-600" />
                </div>
                <Badge variant="outline" className="border-gray-300 text-gray-700">15+ dias</Badge>
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">Tenho Convênio</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Preencha o formulário de solicitação e nossa equipe entrará em contato para verificar elegibilidade.
              </p>
              <a
                href="/Convenio"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Solicitar via convênio
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}