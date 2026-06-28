import * as Icons from "lucide-react";
import { Calendar } from "lucide-react";
import { FadeUp } from "../../FadeUp";
import type { SiteSecao } from "@/lib/cms";

function Eyebrow({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <span className="text-sm font-semibold uppercase tracking-widest text-[#D67F43]">
      {text}
    </span>
  );
}

function Cta({ texto, link }: { texto?: string | null; link?: string | null }) {
  if (!texto || !link) return null;
  const external = link.startsWith("http");
  return (
    <a
      href={link}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-7 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E]"
    >
      <Calendar className="h-4 w-4" />
      {texto}
    </a>
  );
}

function TextoImagem({ secao, reverse }: { secao: SiteSecao; reverse: boolean }) {
  const bg = secao.bg_style === "gradiente"
    ? "bg-gradient-to-b from-gray-50 to-white"
    : "bg-white";
  return (
    <section className={`${bg} py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeUp className={reverse ? "lg:order-1" : "lg:order-2"}>
            <Eyebrow text={secao.eyebrow} />
            {secao.titulo && (
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {secao.titulo}
              </h2>
            )}
            {secao.descricao && (
              <p className="mt-6 leading-relaxed text-gray-600 whitespace-pre-line">
                {secao.descricao}
              </p>
            )}
            {secao.descricao_extra && (
              <p className="mt-4 leading-relaxed text-gray-600 whitespace-pre-line">
                {secao.descricao_extra}
              </p>
            )}
            <Cta texto={secao.cta_texto} link={secao.cta_link} />
          </FadeUp>

          <FadeUp delay={0.15} className={reverse ? "lg:order-2" : "lg:order-1"}>
            {secao.imagem_url && (
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <img src={secao.imagem_url} alt={secao.titulo ?? ""} className="h-full w-full object-cover" />
              </div>
            )}
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function getIcon(name?: string | null) {
  if (!name) return Icons.Sparkles;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? Icons.Sparkles;
}

function GradeCards({ secao }: { secao: SiteSecao }) {
  const bg = secao.bg_style === "gradiente"
    ? "bg-gradient-to-b from-gray-50 to-white"
    : "bg-white";
  const hasImage = !!secao.imagem_url;
  return (
    <section className={`${bg} py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={
            hasImage
              ? "grid grid-cols-1 items-center gap-16 lg:grid-cols-2"
              : "mx-auto max-w-3xl text-center"
          }
        >
          {hasImage && (
            <FadeUp>
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <img src={secao.imagem_url} alt={secao.titulo ?? ""} className="h-full w-full object-cover" />
              </div>
            </FadeUp>
          )}

          <FadeUp delay={0.15}>
            <Eyebrow text={secao.eyebrow} />
            {secao.titulo && (
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {secao.titulo}
              </h2>
            )}
            {secao.descricao && (
              <p className="mt-6 leading-relaxed text-gray-600 whitespace-pre-line">
                {secao.descricao}
              </p>
            )}

            {secao.itens.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {secao.itens.map((it) => {
                  const Icon = getIcon(it.icone);
                  const compact = !it.descricao;
                  return (
                    <div
                      key={it.id}
                      className={`flex ${compact ? "items-center" : "items-start"} gap-3 rounded-xl bg-[#FEF3E8] p-3 text-left`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 text-[#D67F43] ${compact ? "" : "mt-0.5"}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{it.titulo}</p>
                        {it.descricao && (
                          <p className="mt-0.5 text-xs text-gray-500">{it.descricao}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Cta texto={secao.cta_texto} link={secao.cta_link} />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

export function DynamicSection({ secao }: { secao: SiteSecao }) {
  switch (secao.tipo) {
    case "texto-imagem-esquerda":
      return <TextoImagem secao={secao} reverse={false} />;
    case "texto-imagem-direita":
      return <TextoImagem secao={secao} reverse={true} />;
    case "grade-cards":
      return <GradeCards secao={secao} />;
    default:
      return null;
  }
}