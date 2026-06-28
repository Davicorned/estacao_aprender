import { createClient } from "@supabase/supabase-js";

// Projeto Supabase próprio (não Lovable Cloud).
// URL + anon key são públicos por design (RLS protege os dados).
// Configuráveis via variáveis de ambiente para facilitar migração (ex.: Hostinger).
// Fallback aponta para o projeto atual para não quebrar dev local.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://iscgrqldjytzhhvtgcmy.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzY2dycWxkanl0emhodnRnY215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTI4NTYsImV4cCI6MjA5NjMyODg1Nn0.Gs-zqfjHl1UonVph9II1qbK-eCMki7h0yOoCPLLzEXA";

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
    storage: isBrowser ? window.localStorage : undefined,
  },
});

export const SITE_IMAGES_BUCKET = "site-images";

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}