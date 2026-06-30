import * as Icons from "lucide-react";
import { MessageSquare } from "lucide-react";
import { FadeUp } from "../../FadeUp";

type Passo = { icone: string; titulo: string; descricao: string };

const DEFAULT_PASSOS: Passo[] = [
  { icone: "MessageSquare", titulo: "Entre em contato", descricao: "Fale conosco via WhatsApp ou formulário e conte um pouco sobre sua necessidade." },
  { icone: "Calendar", titulo: "Agendamento", descricao: "Nossa equipe irá agendar a consulta inicial no melhor horário para você." },
  { icone: "ClipboardCheck", titulo: "Avaliação inicial", descricao: "Na primeira consulta, realizamos uma avaliação completa para entender as necessidades." },
  { icone: "FileText", titulo: "Plano terapêutico", descricao: "Desenvolvemos um plano personalizado com as melhores intervenções para o caso." },
];

function getIcon(name?: string | null) {
  if (!name) return MessageSquare;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? MessageSquare;
}

type Props = {
  eyebrow?: string;
  titulo?: string;
  passos?: Passo[];
};

export function ProcessSteps({
  eyebrow = "Processo",
  titulo = "Etapas do primeiro atendimento",
  passos = DEFAULT_PASSOS,
}: Props = {}) {
  const cols = passos.length >= 4 ? "lg:grid-cols-4" : passos.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {titulo}
          </h2>
        </FadeUp>

        <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 ${cols}`}>
          {passos.map((p, i) => {
            const Icon = getIcon(p.icone);
            return (
            <FadeUp key={`${p.titulo}-${i}`} delay={i * 0.08}>
              <div className="relative h-full rounded-xl border-0 bg-white p-6 text-center shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-xl font-bold text-white">
                  {i + 1}
                </div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--site-eyebrow)]">
                  <Icon className="h-7 w-7 text-[var(--site-primary)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{p.titulo}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{p.descricao}</p>
                {i < passos.length - 1 && (
                  <div className="absolute top-1/2 -right-4 hidden h-0.5 w-8 bg-[#FBCF9E] lg:block" />
                )}
              </div>
            </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}