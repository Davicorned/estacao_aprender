import { supabase, publicImageUrl } from "@/integrations/supabase/client";

export type TeamMember = {
  id: string;
  nome: string;
  titulo: string;
  foto_url: string | null;
  especialidades: string[];
  bio: string | null;
  registro: string | null;
  order: number;
  enabled: boolean;
};

export type Testimonial = {
  id: string;
  nome: string;
  texto: string;
  fonte: string | null;
  order: number;
  enabled: boolean;
};

export type SiteServico = {
  id: string;
  titulo: string;
  descricao: string | null;
  imagem_url: string | null;
  link: string | null;
  order: number;
  enabled: boolean;
};

export type SiteHero = {
  id: "singleton";
  titulo: string | null;
  titulo_destaque: string | null;
  subtitulo: string | null;
  cta_primario_texto: string | null;
  cta_primario_link: string | null;
  cta_secundario_texto: string | null;
  cta_secundario_link: string | null;
  imagem_url: string | null;
  badge_enabled: boolean;
  badge_titulo: string | null;
  badge_subtitulo: string | null;
  bg_cor: string | null;
  bg_cor_2: string | null;
  texto_cor: string | null; // hex livre — substitui o esquema claro/escuro
};

export type RedeSocial = { tipo: string; url: string };
export type LinkItem = { label: string; href: string };

export type SiteRodape = {
  id: "singleton";
  texto_institucional: string | null;
  telefone: string | null;
  telefone_link: string | null;
  email: string | null;
  endereco_titulo: string | null;
  endereco_texto: string | null;
  copyright: string | null;
  redes_sociais: RedeSocial[];
  links_rapidos: LinkItem[];
  links_servicos: LinkItem[];
  bg_cor: string | null;
  texto_cor: string | null; // 'claro' | 'escuro' | null
  texto_cor_hex: string | null; // hex livre — tem precedência sobre texto_cor
  card_bg_cor: string | null;
  card_texto_cor: string | null;
};

export type SecaoTipo =
  | "texto-imagem-esquerda"
  | "texto-imagem-direita"
  | "grade-cards";

export type SiteSecaoItem = {
  id: string;
  secao_id: string;
  titulo: string;
  descricao: string | null;
  icone: string | null;
  order: number;
};

export type SiteSecao = {
  id: string;
  tipo: SecaoTipo;
  eyebrow: string | null;
  titulo: string | null;
  descricao: string | null;
  descricao_extra: string | null;
  imagem_url: string | null;
  cta_texto: string | null;
  cta_link: string | null;
  bg_style: string | null;
  bg_cor: string | null;
  bg_cor_2: string | null;
  order: number;
  enabled: boolean;
  texto_cor: string | null;
  card_bg_cor: string | null;
  card_texto_cor: string | null;
  card_borda_cor: string | null;
  itens: SiteSecaoItem[];
};

export type SiteHeaderItem = {
  id: string;
  label: string;
  to: string;
  order: number;
  visivel: boolean;
};

export type SiteHeader = {
  id: "singleton";
  logo_url: string | null;
  mostrar_nome: boolean;
  nome_marca: string | null;
  cta_visivel: boolean;
  cta_label: string | null;
  cta_to: string | null;
  bg_cor: string | null;
  bg_cor_2: string | null;
  texto_cor: string | null; // 'claro' | 'escuro' | null
  texto_cor_hex: string | null; // hex livre — tem precedência sobre texto_cor
  cor_destaque: string | null;
  sticky: boolean;
  itens: SiteHeaderItem[];
};

export type SiteTema = {
  id: "singleton";
  cor_primaria: string;
  cor_primaria_hover: string;
  cor_secundaria: string | null;
  cor_texto: string;
  cor_fundo: string;
  cor_eyebrow: string | null;
  fonte_titulos: string;
  fonte_corpo: string;
  radius_px: number;
};

export type SitePagina = {
  id: string;
  slug: string;
  titulo: string;
  is_home: boolean;
  enabled: boolean;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  banner_eyebrow: string | null;
  banner_titulo: string | null;
  banner_descricao: string | null;
  banner_imagem_url: string | null;
  order: number;
};

export const TEMA_DEFAULTS: Omit<SiteTema, "id"> = {
  cor_primaria: "#D67F43",
  cor_primaria_hover: "#C4682E",
  cor_secundaria: null,
  cor_texto: "#1A1A1A",
  cor_fundo: "#FFFFFF",
  cor_eyebrow: null,
  fonte_titulos: "Inter",
  fonte_corpo: "Inter",
  radius_px: 10,
};

// Defaults usados como fallback quando o banco está vazio. Ficam aqui
// como fonte única para o site público e o admin enxergarem o mesmo.
export const HERO_DEFAULTS: Omit<SiteHero, "id"> = {
  titulo: "Cuidamos de cada fase de desenvolvimento do",
  titulo_destaque: "seu filho(a)",
  subtitulo:
    "Equipe multiprofissional especializada no cuidado integral de crianças e adolescentes. Acolhimento, diagnóstico e tratamento personalizados.",
  cta_primario_texto: "Agendar atendimento",
  cta_primario_link:
    "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.",
  cta_secundario_texto: "Conhecer serviços",
  cta_secundario_link: "/Servicos",
  imagem_url:
    "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png",
  badge_enabled: true,
  badge_titulo: "+500 famílias",
  badge_subtitulo: "atendidas com sucesso",
  bg_cor: null,
  bg_cor_2: null,
  texto_cor: null,
};

export const RODAPE_DEFAULTS: Omit<SiteRodape, "id"> = {
  texto_institucional:
    "Cuidando da saúde emocional de crianças, adolescentes e suas famílias com acolhimento e profissionalismo.",
  telefone: "(11) 93213-9815",
  telefone_link: "https://wa.me/5511932139815",
  email: "contato@estacaoaprender.com.br",
  endereco_titulo: "Unidade Engenheiro Goulart",
  endereco_texto: "Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040",
  copyright: "© 2026 Estação Aprender. Todos os direitos reservados.",
  redes_sociais: [
    { tipo: "instagram", url: "https://www.instagram.com/espaco.ide/" },
    { tipo: "facebook", url: "#" },
  ],
  links_rapidos: [
    { label: "O Espaço", href: "/" },
    { label: "Quem Somos", href: "/QuemSomos" },
    { label: "Serviços", href: "/Servicos" },
    { label: "Atendimento", href: "/Atendimento" },
  ],
  links_servicos: [
    { label: "Psicoterapia", href: "/Servicos?servico=psicoterapia" },
    { label: "Avaliação Neuropsicológica", href: "/Servicos?servico=neuropsicologia" },
    { label: "Fonoaudiologia", href: "/Servicos?servico=fonoaudiologia" },
    { label: "Psicopedagogia", href: "/Servicos?servico=psicopedagogia" },
  ],
  bg_cor: null,
  texto_cor: null,
  texto_cor_hex: null,
  card_bg_cor: null,
  card_texto_cor: null,
};

export const HEADER_DEFAULTS: Omit<SiteHeader, "id"> = {
  logo_url: null,
  mostrar_nome: true,
  nome_marca: "Estação Aprender",
  cta_visivel: true,
  cta_label: "Agendar Atendimento",
  cta_to: "/Contato",
  bg_cor: null,
  bg_cor_2: null,
  texto_cor: null,
  texto_cor_hex: null,
  cor_destaque: "#D67F43",
  sticky: true,
  itens: [
    { id: "d1", label: "O Espaço", to: "/", order: 0, visivel: true },
    { id: "d2", label: "Quem Somos", to: "/QuemSomos", order: 1, visivel: true },
    { id: "d3", label: "Serviços", to: "/Servicos", order: 2, visivel: true },
    { id: "d4", label: "Atendimento", to: "/Atendimento", order: 3, visivel: true },
    { id: "d5", label: "Contato", to: "/Contato", order: 4, visivel: true },
  ],
};

let teamCache: { data: TeamMember[]; at: number } | null = null;
let teamInflight: Promise<TeamMember[]> | null = null;
let testimonialsCache: { data: Testimonial[]; at: number } | null = null;
let testimonialsInflight: Promise<Testimonial[]> | null = null;
let servicosCache: { data: SiteServico[]; at: number } | null = null;
let servicosInflight: Promise<SiteServico[]> | null = null;
let heroCache: { data: SiteHero | null; at: number } | null = null;
let heroInflight: Promise<SiteHero | null> | null = null;
let rodapeCache: { data: SiteRodape | null; at: number } | null = null;
let rodapeInflight: Promise<SiteRodape | null> | null = null;
let secoesCache: { data: SiteSecao[]; at: number } | null = null;
let secoesInflight: Promise<SiteSecao[]> | null = null;
let headerCache: { data: SiteHeader | null; at: number } | null = null;
let headerInflight: Promise<SiteHeader | null> | null = null;
let temaCache: { data: SiteTema | null; at: number } | null = null;
let temaInflight: Promise<SiteTema | null> | null = null;
let paginasCache: { data: SitePagina[]; at: number } | null = null;
let paginasInflight: Promise<SitePagina[]> | null = null;
const secoesByPaginaCache = new Map<string, { data: SiteSecao[]; at: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidateCmsCache(which?: "team" | "testimonials" | "servicos" | "hero" | "rodape" | "secoes" | "header" | "tema" | "paginas") {
  if (!which || which === "team") teamCache = null;
  if (!which || which === "testimonials") testimonialsCache = null;
  if (!which || which === "servicos") servicosCache = null;
  if (!which || which === "hero") heroCache = null;
  if (!which || which === "rodape") rodapeCache = null;
  if (!which || which === "secoes") { secoesCache = null; secoesByPaginaCache.clear(); }
  if (!which || which === "header") headerCache = null;
  if (!which || which === "tema") temaCache = null;
  if (!which || which === "paginas") paginasCache = null;
}

export async function fetchTeam(includeDisabled = false): Promise<TeamMember[]> {
  if (!includeDisabled) {
    if (teamCache && Date.now() - teamCache.at < CACHE_TTL_MS) return teamCache.data;
    if (teamInflight) return teamInflight;
  }
  const query = supabase
    .from("team_members")
    .select("id, nome, titulo, foto_url, especialidades, bio, registro, order, enabled")
    .order("order", { ascending: true });
  const run = (async () => {
    const { data, error } = includeDisabled ? await query : await query.eq("enabled", true);
    if (error) {
      console.error("fetchTeam error", error);
      return [];
    }
    const mapped = (data ?? []).map((m) => ({
      ...m,
      foto_url: publicImageUrl(m.foto_url),
    })) as TeamMember[];
    if (!includeDisabled) teamCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  if (!includeDisabled) {
    teamInflight = run.finally(() => { teamInflight = null; });
    return teamInflight;
  }
  return run;
}

export async function fetchTestimonials(includeDisabled = false): Promise<Testimonial[]> {
  if (!includeDisabled) {
    if (testimonialsCache && Date.now() - testimonialsCache.at < CACHE_TTL_MS) return testimonialsCache.data;
    if (testimonialsInflight) return testimonialsInflight;
  }
  const query = supabase
    .from("testimonials")
    .select("id, nome, texto, fonte, order, enabled")
    .order("order", { ascending: true });
  const run = (async () => {
    const { data, error } = includeDisabled ? await query : await query.eq("enabled", true);
    if (error) {
      console.error("fetchTestimonials error", error);
      return [];
    }
    const mapped = (data ?? []) as Testimonial[];
    if (!includeDisabled) testimonialsCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  if (!includeDisabled) {
    testimonialsInflight = run.finally(() => { testimonialsInflight = null; });
    return testimonialsInflight;
  }
  return run;
}

export async function fetchServicos(includeDisabled = false): Promise<SiteServico[]> {
  if (!includeDisabled) {
    if (servicosCache && Date.now() - servicosCache.at < CACHE_TTL_MS) return servicosCache.data;
    if (servicosInflight) return servicosInflight;
  }
  const query = supabase
    .from("site_servicos")
    .select("id, titulo, descricao, imagem_url, link, order, enabled")
    .order("order", { ascending: true });
  const run = (async () => {
    const { data, error } = includeDisabled ? await query : await query.eq("enabled", true);
    if (error) {
      console.error("fetchServicos error", error);
      return [];
    }
    const mapped = (data ?? []).map((s) => ({
      ...s,
      imagem_url: publicImageUrl(s.imagem_url),
    })) as SiteServico[];
    if (!includeDisabled) servicosCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  if (!includeDisabled) {
    servicosInflight = run.finally(() => { servicosInflight = null; });
    return servicosInflight;
  }
  return run;
}

export async function fetchHero(): Promise<SiteHero | null> {
  if (heroCache && Date.now() - heroCache.at < CACHE_TTL_MS) return heroCache.data;
  if (heroInflight) return heroInflight;
  const run = (async () => {
    const { data, error } = await supabase
      .from("site_hero")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();
    if (error) {
      console.error("fetchHero error", error);
      return null;
    }
    const mapped = data
      ? ({ ...data, imagem_url: publicImageUrl(data.imagem_url) } as SiteHero)
      : null;
    heroCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  heroInflight = run.finally(() => { heroInflight = null; });
  return heroInflight;
}

export async function fetchRodape(): Promise<SiteRodape | null> {
  if (rodapeCache && Date.now() - rodapeCache.at < CACHE_TTL_MS) return rodapeCache.data;
  if (rodapeInflight) return rodapeInflight;
  const run = (async () => {
    const { data, error } = await supabase
      .from("site_rodape")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();
    if (error) {
      console.error("fetchRodape error", error);
      return null;
    }
    const mapped = data
      ? ({
          ...data,
          redes_sociais: (data.redes_sociais ?? []) as RedeSocial[],
          links_rapidos: (data.links_rapidos ?? []) as LinkItem[],
          links_servicos: (data.links_servicos ?? []) as LinkItem[],
        } as SiteRodape)
      : null;
    rodapeCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  rodapeInflight = run.finally(() => { rodapeInflight = null; });
  return rodapeInflight;
}

export async function fetchSecoes(includeDisabled = false): Promise<SiteSecao[]> {
  if (!includeDisabled) {
    if (secoesCache && Date.now() - secoesCache.at < CACHE_TTL_MS) return secoesCache.data;
    if (secoesInflight) return secoesInflight;
  }
  const run = (async () => {
    let q = supabase
      .from("site_secoes")
      .select("*, itens:site_secao_itens(*)")
      .order("order", { ascending: true });
    if (!includeDisabled) q = q.eq("enabled", true);
    const { data, error } = await q;
    if (error) {
      console.error("fetchSecoes error", error);
      return [];
    }
    const mapped = (data ?? []).map((s: any) => ({
      ...s,
      imagem_url: publicImageUrl(s.imagem_url),
      itens: ((s.itens ?? []) as SiteSecaoItem[])
        .slice()
        .sort((a, b) => a.order - b.order),
    })) as SiteSecao[];
    if (!includeDisabled) secoesCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  if (!includeDisabled) {
    secoesInflight = run.finally(() => { secoesInflight = null; });
    return secoesInflight;
  }
  return run;
}

export async function fetchHeader(): Promise<SiteHeader | null> {
  if (headerCache && Date.now() - headerCache.at < CACHE_TTL_MS) return headerCache.data;
  if (headerInflight) return headerInflight;
  const run = (async () => {
    const { data, error } = await supabase
      .from("site_header")
      .select("*, itens:site_header_itens(*)")
      .eq("id", "singleton")
      .maybeSingle();
    if (error) {
      console.error("fetchHeader error", error);
      return null;
    }
    const mapped = data
      ? ({
          ...data,
          logo_url: publicImageUrl((data as any).logo_url),
          itens: (((data as any).itens ?? []) as SiteHeaderItem[])
            .slice()
            .sort((a, b) => a.order - b.order),
        } as SiteHeader)
      : null;
    headerCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  headerInflight = run.finally(() => { headerInflight = null; });
  return headerInflight;
}

export async function fetchTema(): Promise<SiteTema | null> {
  if (temaCache && Date.now() - temaCache.at < CACHE_TTL_MS) return temaCache.data;
  if (temaInflight) return temaInflight;
  const run = (async () => {
    const { data, error } = await supabase
      .from("site_tema")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();
    if (error) {
      console.error("fetchTema error", error);
      return null;
    }
    const mapped = data ? (data as SiteTema) : null;
    temaCache = { data: mapped, at: Date.now() };
    return mapped;
  })();
  temaInflight = run.finally(() => { temaInflight = null; });
  return temaInflight;
}