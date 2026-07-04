import { supabase, publicImageUrl } from "@/integrations/supabase/client";

export type BlogStatus = "rascunho" | "publicado";

export type BlogPost = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  conteudo: string;
  capa_url: string | null;
  autor: string | null;
  categoria: string | null;
  tags: string[];
  status: BlogStatus;
  publicado_em: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostPatch = Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">> & {
  id?: string;
};

function mapRow(row: Record<string, unknown>): BlogPost {
  const capa = row.capa_url as string | null;
  const og = row.og_image as string | null;
  return {
    id: row.id as string,
    slug: row.slug as string,
    titulo: row.titulo as string,
    resumo: (row.resumo as string | null) ?? null,
    conteudo: (row.conteudo as string | null) ?? "",
    capa_url: capa ? (capa.startsWith("http") ? capa : publicImageUrl(capa)) : null,
    autor: (row.autor as string | null) ?? null,
    categoria: (row.categoria as string | null) ?? null,
    tags: (row.tags as string[] | null) ?? [],
    status: (row.status as BlogStatus) ?? "rascunho",
    publicado_em: (row.publicado_em as string | null) ?? null,
    meta_title: (row.meta_title as string | null) ?? null,
    meta_description: (row.meta_description as string | null) ?? null,
    og_image: og ? (og.startsWith("http") ? og : publicImageUrl(og)) : null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export async function fetchPostsPublicados(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "publicado")
    .order("publicado_em", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function fetchTodosPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function fetchPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function savePost(patch: BlogPostPatch): Promise<BlogPost> {
  const now = new Date().toISOString();
  const payload = { ...patch, updated_at: now };
  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function publicarPost(id: string): Promise<BlogPost> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ status: "publicado", publicado_em: now, updated_at: now })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function despublicarPost(id: string): Promise<BlogPost> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ status: "rascunho", updated_at: now })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}