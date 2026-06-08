import { supabase } from "@/integrations/supabase/client";

export type Servico = {
  id: string;
  nome: string;
  duracao_min: number;
  valor_centavos: number;
  ativo: boolean;
};

export type Profissional = {
  id: string;
  nome: string;
  titulo: string | null;
  especialidades: string[];
  cor_agenda: string;
  ativo: boolean;
};

export type ClinicaConfig = {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  horario_seg_sex_inicio: string | null;
  horario_seg_sex_fim: string | null;
  horario_sab_inicio: string | null;
  horario_sab_fim: string | null;
  horario_almoco_inicio: string | null;
  horario_almoco_fim: string | null;
};

export const DURACOES = [30, 40, 50, 60, 90, 120] as const;

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte string "R$ 180,00" / "180" / "180,50" para centavos. */
export function parseBRLToCents(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/** Para input enquanto digita: mostra "R$ 1.234,56". */
export function formatBRLInput(value: string): string {
  const cents = parseBRLToCents(value);
  return formatBRL(cents);
}

export async function fetchServicos(includeInactive = true): Promise<Servico[]> {
  const q = supabase.from("servicos").select("*").order("nome");
  const { data, error } = includeInactive ? await q : await q.eq("ativo", true);
  if (error) {
    console.error("fetchServicos", error);
    return [];
  }
  return (data ?? []) as Servico[];
}

export async function fetchProfissionais(includeInactive = true): Promise<Profissional[]> {
  const q = supabase.from("profissionais").select("*").order("nome");
  const { data, error } = includeInactive ? await q : await q.eq("ativo", true);
  if (error) {
    console.error("fetchProfissionais", error);
    return [];
  }
  return (data ?? []) as Profissional[];
}

export async function fetchClinica(): Promise<ClinicaConfig | null> {
  const { data, error } = await supabase
    .from("configuracoes_clinica")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("fetchClinica", error);
    return null;
  }
  return data as ClinicaConfig | null;
}