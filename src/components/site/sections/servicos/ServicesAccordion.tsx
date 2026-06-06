import { Brain, ClipboardList, MessageCircle, GraduationCap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeUp } from "../../FadeUp";

const services = [
  {
    id: "psicoterapia",
    icon: Brain,
    title: "Psicoterapia",
    desc: "Atendimento psicoterápico para crianças e adolescentes com foco em desenvolvimento emocional, comportamental e social. Abordagem personalizada por faixa etária.",
  },
  {
    id: "neuropsicologia",
    icon: ClipboardList,
    title: "Avaliação Neuropsicológica",
    desc: "Avaliação completa do funcionamento cognitivo e comportamental, incluindo atenção, memória, funções executivas e aprendizagem. Laudo detalhado para escola e saúde.",
  },
  {
    id: "fonoaudiologia",
    icon: MessageCircle,
    title: "Fonoaudiologia",
    desc: "Avaliação e tratamento de distúrbios de linguagem, fala, voz, fluência e comunicação oral e escrita. Atendimento para crianças e adolescentes.",
  },
  {
    id: "psicopedagogia",
    icon: GraduationCap,
    title: "Psicopedagogia",
    desc: "Avaliação e intervenção nas dificuldades de aprendizagem escolar. Identifica causas e desenvolve estratégias pedagógicas e terapêuticas personalizadas.",
  },
];

export function ServicesAccordion() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <Accordion type="single" collapsible className="w-full">
            {services.map(({ id, icon: Icon, title, desc }) => (
              <AccordionItem
                key={id}
                value={id}
                className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <AccordionTrigger className="px-6 py-5 hover:bg-gray-50/50 hover:no-underline data-[state=open]:bg-[#FEF3E8]/50">
                  <div className="flex flex-1 items-center gap-4 text-left">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEF3E8] to-[#FDDFC4]">
                      <Icon className="h-6 w-6 text-[#D67F43]" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pl-22 text-base leading-relaxed text-gray-600">
                  <div className="pl-16">{desc}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  );
}