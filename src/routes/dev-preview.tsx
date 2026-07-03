import { createFileRoute } from "@tanstack/react-router";
import { DynamicSection } from "@/components/site/sections/dynamic/DynamicSection";
import type { SecaoTipo, SiteSecao, TeamMember, Testimonial, SiteServico } from "@/lib/cms";
import {
  DEFAULT_MODALIDADES,
  DEFAULT_CONTATO_MAPA,
  DEFAULT_EQUIPE,
  DEFAULT_DEPOIMENTOS,
  DEFAULT_CTA_BANNER,
} from "@/lib/site-templates";

type Search = { tipo?: string; layout?: string };

export const Route = createFileRoute("/dev-preview")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tipo: typeof s.tipo === "string" ? s.tipo : undefined,
    layout: typeof s.layout === "string" ? s.layout : undefined,
  }),
  head: () => ({ meta: [{ title: "Dev preview" }, { name: "robots", content: "noindex" }] }),
  component: DevPreview,
});

const MOCK_TEAM: TeamMember[] = [
  { id: "t1", nome: "Dra. Erica Silva", titulo: "Psicóloga Infantil", foto_url: null, especialidades: ["TDAH", "Ansiedade", "Autismo"], bio: "Especialista em desenvolvimento infantil.", registro: "CRP 06/123456", order: 0, enabled: true },
  { id: "t2", nome: "Dr. João Almeida Santos", titulo: "Fonoaudiólogo", foto_url: null, especialidades: ["Linguagem", "Fala"], bio: "Atendimento humanizado com foco em resultados.", registro: "CRFa 2-98765", order: 1, enabled: true },
  { id: "t3", nome: "Dra. Mariana Costa", titulo: "Terapeuta Ocupacional", foto_url: null, especialidades: ["Integração sensorial", "Motricidade"], bio: "Foco em autonomia e regulação sensorial.", registro: "CREFITO 12345", order: 2, enabled: true },
  { id: "t4", nome: "Dr. Pedro Henrique", titulo: "Psicopedagogo", foto_url: null, especialidades: ["Aprendizagem", "Dislexia"], bio: "Avaliação e intervenção em dificuldades escolares.", registro: "ABPp 6789", order: 3, enabled: true },
  { id: "t5", nome: "Dra. Ana Beatriz", titulo: "Neuropsicóloga", foto_url: null, especialidades: ["Avaliação"], bio: "Avaliações neuropsicológicas completas.", registro: "CRP 06/54321", order: 4, enabled: true },
];

const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: "d1", nome: "Ana Paula", texto: "Atendimento incrível, minha filha evoluiu muito nas últimas semanas — recomendo demais para todas as famílias que precisam.", fonte: "Google", order: 0, enabled: true },
  { id: "d2", nome: "Carlos Mendes", texto: "Ambiente acolhedor e equipe muito atenciosa. Fez toda a diferença para o nosso filho.", fonte: "Instagram", order: 1, enabled: true },
  { id: "d3", nome: "Juliana Rocha", texto: "Profissionais competentes e um cuidado enorme com cada detalhe do processo terapêutico.", fonte: "Google", order: 2, enabled: true },
  { id: "d4", nome: "Renata Silveira", texto: "Muito além do que esperávamos. Recomendo para todas as famílias.", fonte: "Google", order: 3, enabled: true },
  { id: "d5", nome: "Marcelo Torres", texto: "Excelente equipe, muito paciência e didática com as crianças.", fonte: "Facebook", order: 4, enabled: true },
  { id: "d6", nome: "Beatriz Nogueira", texto: "Meu filho ama vir para as sessões. Só temos a agradecer.", fonte: "Google", order: 5, enabled: true },
];

const MOCK_SERVICOS: SiteServico[] = [
  { id: "s1", titulo: "Psicologia Infantil", descricao: "Acompanhamento terapêutico para crianças.", imagem_url: null, icone: "Brain", link: null, order: 0, enabled: true },
  { id: "s2", titulo: "Fonoaudiologia", descricao: "Avaliação e intervenção em linguagem e fala.", imagem_url: null, icone: "MessageCircle", link: null, order: 1, enabled: true },
  { id: "s3", titulo: "Terapia Ocupacional", descricao: "Estimulação sensorial e motricidade.", imagem_url: null, icone: "Sparkles", link: null, order: 2, enabled: true },
];

function baseSecao(tipo: SecaoTipo, dados: Record<string, any> = {}): SiteSecao {
  return {
    id: "preview",
    tipo,
    eyebrow: "Preview",
    titulo: labelForTipo(tipo),
    descricao:
      "Descrição de exemplo para validar responsividade em telas mobile pequenas com texto suficiente para caber em duas linhas.",
    descricao_extra: null,
    imagem_url: null,
    cta_texto: "Falar no WhatsApp",
    cta_link: "https://wa.me/5511932139815",
    bg_style: "branco",
    bg_cor: null,
    bg_cor_2: null,
    order: 0,
    enabled: true,
    texto_cor: null,
    card_bg_cor: null,
    card_texto_cor: null,
    card_borda_cor: null,
    itens: [],
    dados,
  };
}

function labelForTipo(tipo: SecaoTipo): string {
  const map: Record<string, string> = {
    "cta-banner": "Vamos conversar sobre o próximo passo?",
    "equipe": "Nossa equipe de profissionais especializados",
    "depoimentos": "O que as famílias dizem sobre nós",
    "contato-mapa": "Entre em contato com a nossa equipe",
    "modalidades": "Escolha a modalidade ideal para você",
  };
  return map[tipo] ?? "Seção de exemplo";
}

function buildSecao(tipo: SecaoTipo, layout: string | undefined): SiteSecao {
  switch (tipo) {
    case "cta-banner": {
      const s = baseSecao(tipo, { ...DEFAULT_CTA_BANNER, layout: layout ?? DEFAULT_CTA_BANNER.layout });
      if (layout === "com-imagem") {
        s.imagem_url =
          "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=1600&q=60";
      }
      return s;
    }
    case "equipe":
      return baseSecao(tipo, { ...DEFAULT_EQUIPE, layout: layout ?? DEFAULT_EQUIPE.layout });
    case "depoimentos":
      return baseSecao(tipo, { ...DEFAULT_DEPOIMENTOS, layout: layout ?? DEFAULT_DEPOIMENTOS.layout });
    case "contato-mapa":
      return baseSecao(tipo, { ...DEFAULT_CONTATO_MAPA, layout: layout ?? DEFAULT_CONTATO_MAPA.layout });
    case "modalidades":
      return baseSecao(tipo, DEFAULT_MODALIDADES);
    default:
      return baseSecao(tipo);
  }
}

function DevPreview() {
  const { tipo, layout } = Route.useSearch();
  if (!tipo) {
    return (
      <div className="p-8 text-sm">
        Use <code>?tipo=cta-banner&amp;layout=centralizado</code> na URL.
      </div>
    );
  }
  const secao = buildSecao(tipo as SecaoTipo, layout);
  return (
    <div data-dev-preview={`${tipo}:${layout ?? "default"}`}>
      <DynamicSection
        secao={secao}
        team={MOCK_TEAM}
        testimonials={MOCK_TESTIMONIALS}
        servicos={MOCK_SERVICOS}
      />
    </div>
  );
}