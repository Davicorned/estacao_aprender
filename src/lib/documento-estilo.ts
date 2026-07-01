import { supabase } from "@/integrations/supabase/client";

export type HeaderEstilo =
  | "curva"
  | "barra"
  | "linha"
  | "timbrado"
  | "faixa-lateral"
  | "canto"
  | "moldura"
  | "nenhum";

export type LogoAlinhamento = "esquerda" | "centro";

export type DocumentoEstilo = {
  id: "singleton";
  logo_url: string | null;
  logo_alinhamento: LogoAlinhamento;
  header_estilo: HeaderEstilo;
  header_cor: string;
  header_cor_2: string | null;
  header_texto_cor: string;
  header_altura: number;
  mostrar_tagline: boolean;
  tagline: string | null;
  rodape_mostrar: boolean;
  rodape_usar_clinica: boolean;
  rodape_telefone: string | null;
  rodape_instagram: string | null;
  rodape_endereco: string | null;
  rodape_cor: string | null;
  mostrar_paginacao: boolean;
  fonte: string;
};

export const DOC_ESTILO_DEFAULTS: DocumentoEstilo = {
  id: "singleton",
  logo_url: null,
  logo_alinhamento: "esquerda",
  header_estilo: "curva",
  header_cor: "#E08A3C",
  header_cor_2: null,
  header_texto_cor: "#FFFFFF",
  header_altura: 170,
  mostrar_tagline: true,
  tagline:
    "Psicopedagogia · Psicomotricidade · Psicologia · Neuropsicologia · Alfabetização · Educação Neuroparental",
  rodape_mostrar: true,
  rodape_usar_clinica: true,
  rodape_telefone: null,
  rodape_instagram: null,
  rodape_endereco: null,
  rodape_cor: null,
  mostrar_paginacao: true,
  fonte: "Inter",
};

export const HEADER_ESTILO_OPTIONS: { value: HeaderEstilo; label: string; hint: string }[] = [
  { value: "curva", label: "Curva", hint: "Faixa curva no topo (padrão)" },
  { value: "barra", label: "Barra", hint: "Retângulo sólido no topo" },
  { value: "linha", label: "Linha", hint: "Logo + linha divisória fina" },
  { value: "timbrado", label: "Timbrado", hint: "Centralizado, nome da clínica" },
  { value: "faixa-lateral", label: "Faixa lateral", hint: "Banda vertical na esquerda" },
  { value: "canto", label: "Canto", hint: "Triângulo diagonal no canto" },
  { value: "moldura", label: "Moldura", hint: "Borda ao redor da página" },
  { value: "nenhum", label: "Nenhum", hint: "Sem faixa, logo mínimo" },
];

let cache: DocumentoEstilo | null = null;

export async function fetchDocumentoEstilo(force = false): Promise<DocumentoEstilo> {
  if (cache && !force) return cache;
  const { data, error } = await supabase
    .from("documento_estilo")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();
  if (error) {
    console.error("fetchDocumentoEstilo", error);
    return DOC_ESTILO_DEFAULTS;
  }
  const merged: DocumentoEstilo = { ...DOC_ESTILO_DEFAULTS, ...(data as any) };
  cache = merged;
  return merged;
}

export function invalidateDocumentoEstiloCache() {
  cache = null;
}

export async function saveDocumentoEstilo(patch: Partial<DocumentoEstilo>): Promise<DocumentoEstilo> {
  const payload = { id: "singleton", ...patch, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("documento_estilo")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  invalidateDocumentoEstiloCache();
  const merged: DocumentoEstilo = { ...DOC_ESTILO_DEFAULTS, ...(data as any) };
  cache = merged;
  return merged;
}