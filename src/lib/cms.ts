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

let teamCache: { data: TeamMember[]; at: number } | null = null;
let teamInflight: Promise<TeamMember[]> | null = null;
let testimonialsCache: { data: Testimonial[]; at: number } | null = null;
let testimonialsInflight: Promise<Testimonial[]> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

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