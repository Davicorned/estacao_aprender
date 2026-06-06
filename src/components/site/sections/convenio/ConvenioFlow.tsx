import { Zap } from "lucide-react";
import { FadeUp } from "@/components/site/FadeUp";

const STEPS = [
  {
    title: "Você envia seus dados",
    desc: "Preencha o formulário com suas informações e o plano de saúde que possui.",
  },
  {
    title: "Nossa equipe valida",
    desc: "Verificamos a elegibilidade do seu plano e disponibilidade de horários.",
  },
  {
    title: "Entramos em contato",
    desc: "Retornamos em até 2 dias úteis com orientações e opções de agendamento.",
  },
];

const CONVENIOS = [
  "Amil",
  "Bradesco Saúde",
  "SulAmérica",
  "Unimed",
  "Porto Seguro",
  "NotreDame",
  "Hapvida",
];

const WA_PARTICULAR =
  "https://wa.me/5511966654857?text=" +
  encodeURIComponent("Olá! Gostaria de agendar uma consulta particular no Estação Aprender.");

export function ConvenioFlow() {
  return (
    <FadeUp>
      <h2 className="mb-8 text-3xl font-bold text-gray-900">Como funciona o fluxo</h2>

      <div className="mb-10 space-y-6">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 font-bold text-white">
              {i + 1}
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-gray-900">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-0 bg-gray-50 p-6 shadow">
        <h3 className="mb-3 font-semibold text-gray-900">Principais convênios aceitos*</h3>
        <div className="flex flex-wrap gap-2">
          {CONVENIOS.map((c) => (
            <span
              key={c}
              className="inline-flex rounded-md border bg-white px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          *Sujeito a verificação de elegibilidade. Outros convênios podem ser aceitos.
        </p>
      </div>

      <div className="mt-6 rounded-xl border-2 border-[#FBCF9E] bg-gradient-to-br from-[#FEF3E8] to-[#FDDFC4] p-6 shadow">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#FEF3E8]">
            <Zap className="h-6 w-6 text-[#B85A24]" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-gray-900">Não quer esperar?</h3>
            <p className="mb-4 text-sm text-gray-600">
              Consulta particular com agendamento em até 24 horas.
            </p>
            <a
              id="whatsapp_start"
              href={WA_PARTICULAR}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-4 text-sm font-medium text-white shadow hover:from-[#B85A24] hover:to-[#A04E1E]"
            >
              Agendar particular
            </a>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}