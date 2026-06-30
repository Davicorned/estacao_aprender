import * as Icons from "lucide-react";
import { Brain } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeUp } from "../../FadeUp";

type Servico = { id: string; icone: string; titulo: string; descricao: string };

const DEFAULT_SERVICOS: Servico[] = [
  {
    id: "psicoterapia",
    icone: "Brain",
    titulo: "Psicoterapia",
    descricao: "Atendimento psicoterápico para crianças e adolescentes com foco em desenvolvimento emocional, comportamental e social. Abordagem personalizada por faixa etária.",
  },
  {
    id: "neuropsicologia",
    icone: "ClipboardList",
    titulo: "Avaliação Neuropsicológica",
    descricao: "Avaliação completa do funcionamento cognitivo e comportamental, incluindo atenção, memória, funções executivas e aprendizagem. Laudo detalhado para escola e saúde.",
  },
  {
    id: "fonoaudiologia",
    icone: "MessageCircle",
    titulo: "Fonoaudiologia",
    descricao: "Avaliação e tratamento de distúrbios de linguagem, fala, voz, fluência e comunicação oral e escrita. Atendimento para crianças e adolescentes.",
  },
  {
    id: "psicopedagogia",
    icone: "GraduationCap",
    titulo: "Psicopedagogia",
    descricao: "Avaliação e intervenção nas dificuldades de aprendizagem escolar. Identifica causas e desenvolve estratégias pedagógicas e terapêuticas personalizadas.",
  },
];

function getIcon(name?: string | null) {
  if (!name) return Brain;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? Brain;
}

type Props = { servicos?: Servico[] };

export function ServicesAccordion({ servicos = DEFAULT_SERVICOS }: Props = {}) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <Accordion type="single" collapsible className="w-full">
            {servicos.map((s) => {
              const Icon = getIcon(s.icone);
              return (
              <AccordionItem
                key={s.id}
                value={s.id}
                className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <AccordionTrigger className="px-6 py-5 hover:bg-gray-50/50 hover:no-underline data-[state=open]:bg-[var(--site-soft)]/70">
                  <div className="flex flex-1 items-center gap-4 text-left">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-soft)] to-[var(--site-soft-2)]">
                      <Icon className="h-6 w-6 text-[var(--site-primary)]" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{s.titulo}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pl-22 text-base leading-relaxed text-gray-600">
                  <div className="pl-16">{s.descricao}</div>
                </AccordionContent>
              </AccordionItem>
              );
            })}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  );
}