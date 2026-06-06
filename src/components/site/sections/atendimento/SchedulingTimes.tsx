import { Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "../../FadeUp";

const WA = "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.";

export function SchedulingTimes() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#D67F43]">
            Prazos de agendamento
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tempo de espera por modalidade
          </h2>
        </FadeUp>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Particular */}
          <FadeUp>
            <div className="rounded-xl border-2 border-[#FBCF9E] bg-gradient-to-br from-[#FEF3E8] to-[#FDDFC4] p-8 shadow">
              <Badge className="bg-[#FEF3E8]0 text-white hover:bg-[#D67F43]">
                <Zap className="mr-1 h-3 w-3" />
                Mais Rápido
              </Badge>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Consulta Particular</h3>
              <div className="mt-4 flex items-center gap-2">
                <Clock className="h-7 w-7 text-[#D67F43]" />
                <span className="text-3xl font-bold text-[#D67F43]">Até 24h</span>
              </div>
              <p className="mt-4 leading-relaxed text-gray-600">
                Agende sua consulta e seja atendido rapidamente. Disponibilidade imediata conforme agenda.
              </p>
              <a
                id="whatsapp_start"
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E]"
              >
                Agendar agora
              </a>
            </div>
          </FadeUp>

          {/* Convênio */}
          <FadeUp delay={0.1}>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow">
              <Badge variant="outline" className="border-gray-300 text-gray-700">
                Convênio / Plano
              </Badge>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Consulta por Convênio</h3>
              <div className="mt-4 flex items-center gap-2">
                <Clock className="h-7 w-7 text-gray-500" />
                <span className="text-3xl font-bold text-gray-700">15+ dias</span>
              </div>
              <p className="mt-4 leading-relaxed text-gray-600">
                Prazo médio para agendamento via convênio. Depende de elegibilidade e disponibilidade.
              </p>
              <a
                href="/Convenio"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Solicitar via convênio
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}