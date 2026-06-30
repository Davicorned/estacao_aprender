import { MessageSquare, Calendar, ClipboardCheck, FileText } from "lucide-react";
import { FadeUp } from "../../FadeUp";

const steps = [
  { icon: MessageSquare, title: "Entre em contato", desc: "Fale conosco via WhatsApp ou formulário e conte um pouco sobre sua necessidade." },
  { icon: Calendar, title: "Agendamento", desc: "Nossa equipe irá agendar a consulta inicial no melhor horário para você." },
  { icon: ClipboardCheck, title: "Avaliação inicial", desc: "Na primeira consulta, realizamos uma avaliação completa para entender as necessidades." },
  { icon: FileText, title: "Plano terapêutico", desc: "Desenvolvemos um plano personalizado com as melhores intervenções para o caso." },
];

export function ProcessSteps() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            Processo
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Etapas do primeiro atendimento
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.08}>
              <div className="relative h-full rounded-xl border-0 bg-white p-6 text-center shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-xl font-bold text-white">
                  {i + 1}
                </div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--site-eyebrow)]">
                  <Icon className="h-7 w-7 text-[var(--site-primary)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 hidden h-0.5 w-8 bg-[#FBCF9E] lg:block" />
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}