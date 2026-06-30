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
  order: number;
  enabled: boolean;
  itens: SiteSecaoItem[];
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
const CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidateCmsCache(which?: "team" | "testimonials" | "servicos" | "hero" | "rodape" | "secoes") {
  if (!which || which === "team") teamCache = null;
  if (!which || which === "testimonials") testimonialsCache = null;
  if (!which || which === "servicos") servicosCache = null;
  if (!which || which === "hero") heroCache = null;
  if (!which || which === "rodape") rodapeCache = null;
  if (!which || which === "secoes") secoesCache = null;
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