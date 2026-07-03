import * as Icons from "lucide-react";
import { Heart, Award, Users, Shield } from "lucide-react";
import { FadeUp } from "../../FadeUp";
import type { CardsIconesLayout } from "@/lib/site-templates";

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
  layout?: CardsIconesLayout;
  colunas?: 2 | 3 | 4;
};

export function OurValues({
  eyebrow = "Nossos valores",
  titulo = "O que nos guia",
  itens = DEFAULT_ITENS,
  layout = "grade",
  colunas = 3,
}: Props = {}) {
  const colsClass =
    colunas === 4 ? "lg:grid-cols-4"
    : colunas === 2 ? "lg:grid-cols-2"
    : "lg:grid-cols-3";

  function wrapLink(key: string, node: React.ReactNode, link?: string | null) {
    if (!link) return <>{node}</>;
    return (
      <a
        href={link}
        className="block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)]"
      >
        {node}
      </a>
    );
  }

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-12 text-center sm:mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {titulo}
          </h2>
        </FadeUp>

        {layout === "grade" && (
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${colsClass}`}>
            {itens.map((v, i) => {
              const Icon = getIcon(v.icone);
              const inner = (
                <div className="flex h-full flex-col rounded-xl border-0 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-soft)] to-[var(--site-soft-2)]">
                    <Icon className="h-7 w-7 text-[var(--site-primary)]" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{v.titulo}</h3>
                  <p className="text-gray-600">{v.descricao}</p>
                </div>
              );
              return (
                <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.08} className="h-full">
                  {wrapLink(String(i), inner, v.link)}
                </FadeUp>
              );
            })}
          </div>
        )}

        {layout === "icone-lado" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {itens.map((v, i) => {
              const Icon = getIcon(v.icone);
              const inner = (
                <div className="flex h-full items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-soft)] to-[var(--site-soft-2)]">
                    <Icon className="h-6 w-6 text-[var(--site-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{v.titulo}</h3>
                    <p className="text-sm text-gray-600">{v.descricao}</p>
                  </div>
                </div>
              );
              return (
                <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.08} className="h-full">
                  {wrapLink(String(i), inner, v.link)}
                </FadeUp>
              );
            })}
          </div>
        )}

        {layout === "circulos" && (
          <div className={`grid grid-cols-1 gap-8 sm:grid-cols-2 ${colsClass}`}>
            {itens.map((v, i) => {
              const Icon = getIcon(v.icone);
              const inner = (
                <div className="flex h-full flex-col items-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--site-primary)] shadow-md">
                    <Icon className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{v.titulo}</h3>
                  <p className="text-sm text-gray-600">{v.descricao}</p>
                </div>
              );
              return (
                <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.08} className="h-full">
                  {wrapLink(String(i), inner, v.link)}
                </FadeUp>
              );
            })}
          </div>
        )}

        {layout === "lista" && (
          <div className="mx-auto max-w-3xl divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {itens.map((v, i) => {
              const Icon = getIcon(v.icone);
              const inner = (
                <div className="flex items-start gap-4 p-5 transition-colors hover:bg-gray-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--site-soft)]">
                    <Icon className="h-5 w-5 text-[var(--site-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-0.5 text-base font-semibold text-gray-900">{v.titulo}</h3>
                    <p className="text-sm text-gray-600">{v.descricao}</p>
                  </div>
                </div>
              );
              return (
                <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.06}>
                  {wrapLink(String(i), inner, v.link)}
                </FadeUp>
              );
            })}
          </div>
        )}

        {layout === "borda-colorida" && (
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${colsClass}`}>
            {itens.map((v, i) => {
              const Icon = getIcon(v.icone);
              const inner = (
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="h-1.5 w-full bg-[var(--site-primary)]" />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--site-soft)]">
                      <Icon className="h-6 w-6 text-[var(--site-primary)]" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{v.titulo}</h3>
                    <p className="text-sm text-gray-600">{v.descricao}</p>
                  </div>
                </div>
              );
              return (
                <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.08} className="h-full">
                  {wrapLink(String(i), inner, v.link)}
                </FadeUp>
              );
            })}
          </div>
        )}

        {layout === "numerados" && (
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${colsClass}`}>
            {itens.map((v, i) => {
              const inner = (
                <div className="flex h-full items-start gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-primary)] text-lg font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{v.titulo}</h3>
                    <p className="text-sm text-gray-600">{v.descricao}</p>
                  </div>
                </div>
              );
              return (
                <FadeUp key={`${v.titulo}-${i}`} delay={i * 0.08} className="h-full">
                  {wrapLink(String(i), inner, v.link)}
                </FadeUp>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}