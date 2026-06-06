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

export async function fetchTeam(includeDisabled = false): Promise<TeamMember[]> {
  const query = supabase
    .from("team_members")
    .select("id, nome, titulo, foto_url, especialidades, bio, registro, order, enabled")
    .order("order", { ascending: true });
  const { data, error } = includeDisabled ? await query : await query.eq("enabled", true);
  if (error) {
    console.error("fetchTeam error", error);
    return [];
  }
  return (data ?? []).map((m) => ({
    ...m,
    foto_url: publicImageUrl(m.foto_url),
  })) as TeamMember[];
}

export async function fetchTestimonials(includeDisabled = false): Promise<Testimonial[]> {
  const query = supabase
    .from("testimonials")
    .select("id, nome, texto, fonte, order, enabled")
    .order("order", { ascending: true });
  const { data, error } = includeDisabled ? await query : await query.eq("enabled", true);
  if (error) {
    console.error("fetchTestimonials error", error);
    return [];
  }
  return (data ?? []) as Testimonial[];
}