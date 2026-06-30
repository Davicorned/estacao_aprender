import * as Icons from "lucide-react";
import { Calendar } from "lucide-react";
import { FadeUp } from "../../FadeUp";
import type { SiteSecao } from "@/lib/cms";
import { buildBackground } from "@/components/gestao/site/ColorField";
import { OurValues } from "../quemsomos/OurValues";
import { Founder } from "../quemsomos/Founder";
import { ProcessSteps } from "../atendimento/ProcessSteps";
import { Modalities } from "../atendimento/Modalities";
import { ServicesAccordion } from "../servicos/ServicesAccordion";
import { Contact } from "../Contact";
import { CTABanner } from "../../CTABanner";
import {
  DEFAULT_CONTATO_MAPA,
  DEFAULT_MODALIDADES,
  type DadosContatoMapa,
  type DadosModalidades,
} from "@/lib/site-templates";

function Eyebrow({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-eyebrow)]">
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
      className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)] px-7 text-sm font-medium text-white shadow-lg shadow-[var(--site-primary)]/25 transition-all hover:from-[var(--site-primary-hover)] hover:to-[var(--site-primary-hover)]"
    >
      <Calendar className="h-4 w-4" />
      {texto}
    </a>
  );
}

function TextoImagem({ secao, reverse }: { secao: SiteSecao; reverse: boolean }) {
  const customBg = buildBackground(secao.bg_cor, secao.bg_cor_2);
  const bg = customBg
    ? ""
    : secao.bg_style === "gradiente"
      ? "bg-gradient-to-b from-gray-50 to-white"
      : "bg-white";
  const textColor = secao.texto_cor || null;
  return (
    <section
      className={`${bg} py-20`}
      style={{
        ...(customBg ? { background: customBg } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeUp className={reverse ? "lg:order-1" : "lg:order-2"}>
            <Eyebrow text={secao.eyebrow} />
            {secao.titulo && (
              <h2
                className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${textColor ? "" : "text-gray-900"}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {secao.titulo}
              </h2>
            )}
            {secao.descricao && (
              <p
                className={`mt-6 leading-relaxed whitespace-pre-line ${textColor ? "opacity-90" : "text-gray-600"}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {secao.descricao}
              </p>
            )}
            {secao.descricao_extra && (
              <p
                className={`mt-4 leading-relaxed whitespace-pre-line ${textColor ? "opacity-90" : "text-gray-600"}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {secao.descricao_extra}
              </p>
            )}
            <Cta texto={secao.cta_texto} link={secao.cta_link} />
          </FadeUp>

          <FadeUp delay={0.15} className={reverse ? "lg:order-2" : "lg:order-1"}>
            {secao.imagem_url && (
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <img src={secao.imagem_url ?? undefined} alt={secao.titulo ?? ""} className="h-full w-full object-cover" />
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
  const customBg = buildBackground(secao.bg_cor, secao.bg_cor_2);
  const bg = customBg
    ? ""
    : secao.bg_style === "gradiente"
      ? "bg-gradient-to-b from-gray-50 to-white"
      : "bg-white";
  const hasImage = !!secao.imagem_url;
  const textColor = secao.texto_cor || null;
  const cardBg = secao.card_bg_cor || null;
  const cardText = secao.card_texto_cor || null;
  const cardBorder = secao.card_borda_cor || null;
  const cardStyle = cardBg || cardText || cardBorder
    ? {
        ...(cardBg ? { backgroundColor: cardBg } : {}),
        ...(cardText ? { color: cardText } : {}),
        ...(cardBorder ? { borderColor: cardBorder, borderWidth: 1, borderStyle: "solid" as const } : {}),
      }
    : undefined;
  return (
    <section
      className={`${bg} py-20`}
      style={{
        ...(customBg ? { background: customBg } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
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
                <img src={secao.imagem_url ?? undefined} alt={secao.titulo ?? ""} className="h-full w-full object-cover" />
              </div>
            </FadeUp>
          )}

          <FadeUp delay={0.15}>
            <Eyebrow text={secao.eyebrow} />
            {secao.titulo && (
              <h2
                className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${textColor ? "" : "text-gray-900"}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {secao.titulo}
              </h2>
            )}
            {secao.descricao && (
              <p
                className={`mt-6 leading-relaxed whitespace-pre-line ${textColor ? "opacity-90" : "text-gray-600"}`}
                style={textColor ? { color: textColor } : undefined}
              >
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
                      className={`flex ${compact ? "items-center" : "items-start"} gap-3 rounded-xl p-3 text-left ${cardStyle ? "" : "bg-[var(--site-soft)]"}`}
                      style={cardStyle}
                    >
                      <Icon className={`h-5 w-5 shrink-0 text-[var(--site-primary)] ${compact ? "" : "mt-0.5"}`} />
                      <div>
                        <p
                          className={`text-sm font-medium ${cardText ? "" : "text-gray-700"}`}
                          style={cardText ? { color: cardText } : undefined}
                        >
                          {it.titulo}
                        </p>
                        {it.descricao && (
                          <p
                            className={`mt-0.5 text-xs ${cardText ? "opacity-75" : "text-gray-500"}`}
                            style={cardText ? { color: cardText } : undefined}
                          >
                            {it.descricao}
                          </p>
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
    case "cards-icones":
      return (
        <OurValues
          eyebrow={secao.eyebrow ?? undefined}
          titulo={secao.titulo ?? undefined}
          itens={secao.itens.map((it) => ({
            icone: it.icone ?? "Sparkles",
            titulo: it.titulo,
            descricao: it.descricao ?? "",
            link: it.link ?? null,
          }))}
        />
      );
    case "passos-processo":
      return (
        <ProcessSteps
          eyebrow={secao.eyebrow ?? undefined}
          titulo={secao.titulo ?? undefined}
          passos={secao.itens.map((it) => ({
            icone: it.icone ?? "Sparkles",
            titulo: it.titulo,
            descricao: it.descricao ?? "",
          }))}
        />
      );
    case "accordion":
      return (
        <ServicesAccordion
          servicos={secao.itens.map((it) => ({
            id: it.id,
            icone: it.icone ?? "Sparkles",
            titulo: it.titulo,
            descricao: it.descricao ?? "",
          }))}
        />
      );
    case "cta-banner":
      return (
        <CTABanner
          title={secao.titulo ?? undefined}
          description={secao.descricao ?? undefined}
          buttonLabel={secao.cta_texto ?? undefined}
          href={secao.cta_link ?? undefined}
        />
      );
    case "destaque-pessoa":
      return (
        <Founder
          eyebrow={secao.eyebrow ?? undefined}
          titulo={secao.titulo ?? undefined}
          legenda={secao.descricao ?? undefined}
          imagem_url={secao.imagem_url ?? undefined}
        />
      );
    case "modalidades": {
      const d = (secao.dados ?? {}) as Partial<DadosModalidades>;
      const cards = d.cards && d.cards.length > 0 ? d.cards : DEFAULT_MODALIDADES.cards;
      return (
        <Modalities
          eyebrow={secao.eyebrow ?? undefined}
          titulo={secao.titulo ?? undefined}
          cards={cards}
        />
      );
    }
    case "contato-mapa": {
      const d = (secao.dados ?? {}) as Partial<DadosContatoMapa>;
      return (
        <Contact
          eyebrow={secao.eyebrow ?? undefined}
          titulo={secao.titulo ?? undefined}
          descricao={secao.descricao ?? undefined}
          telefone={d.telefone ?? DEFAULT_CONTATO_MAPA.telefone}
          telefone_link={d.telefone_link ?? DEFAULT_CONTATO_MAPA.telefone_link}
          email={d.email ?? DEFAULT_CONTATO_MAPA.email}
          endereco_titulo={d.endereco_titulo ?? DEFAULT_CONTATO_MAPA.endereco_titulo}
          endereco_texto={d.endereco_texto ?? DEFAULT_CONTATO_MAPA.endereco_texto}
          horarios={d.horarios ?? DEFAULT_CONTATO_MAPA.horarios}
          mapa_embed_url={d.mapa_embed_url ?? DEFAULT_CONTATO_MAPA.mapa_embed_url}
        />
      );
    }
    default:
      return null;
  }
}