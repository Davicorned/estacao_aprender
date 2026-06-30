import * as Icons from "lucide-react";
import { Heart, Award, Users, Shield } from "lucide-react";
import { FadeUp } from "../../FadeUp";

type Valor = { icone: string; titulo: string; descricao: string; link?: string | null };

const DEFAULT_ITENS: Valor[] = [
  {
    icone: "Heart",
    titulo: "Acolhimento",
    descricao:
      "Ambiente acolhedor e seguro para crianças e famílias, onde cada pessoa se sente respeitada e compreendida.",
  },
  {
    icone: "Award",
    titulo: "Excelência",
    descricao:
      "Compromisso com a qualidade no atendimento, utilizando técnicas baseadas em evidências científicas.",
  },
  {
    icone: "Users",
    titulo: "Cuidado Integral",
    descricao:
      "Abordagem multidisciplinar que considera todos os aspectos do desenvolvimento infantojuvenil.",
  },
  {
    icone: "Shield",
    titulo: "Transparência",
    descricao:
      "Comunicação clara e honesta com as famílias sobre o processo terapêutico e evolução.",
  },
];

function getIcon(name?: string | null) {
  if (!name) return Heart;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? Heart;
}

type Props = {
  eyebrow?: string;
  titulo?: string;
  itens?: Valor[];
};

export function OurValues({
  eyebrow = "Nossos valores",
  titulo = "O que nos guia",
  itens = DEFAULT_ITENS,
}: Props = {}) {
  const cols = itens.length >= 4 ? "lg:grid-cols-4" : itens.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
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

        <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${cols}`}>
          {itens.map((v, i) => {
            const Icon = getIcon(v.icone);
            const Inner = (
              <div className="flex h-full flex-col rounded-xl border-0 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-eyebrow)] to-[#FDDFC4]">
                  <Icon className="h-7 w-7 text-[var(--site-primary)]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{v.titulo}</h3>
                <p className="text-gray-600">{v.descricao}</p>
              </div>
            );
            return (
              <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.08} className="h-full">
                {v.link ? (
                  <a href={v.link} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)] rounded-xl">
                    {Inner}
                  </a>
                ) : Inner}
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}