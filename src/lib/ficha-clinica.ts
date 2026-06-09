import { supabase } from "@/integrations/supabase/client";

export type MedicoExterno = {
  nome: string;
  especialidade: string;
  contato: string;
};

export type FichaClinica = {
  paciente_id: string;
  data_abertura: string | null;
  especialidades_interesse: string[];
  queixa_inicial: string | null;
  limitacoes: string[];
  limitacoes_outras: string | null;
  alergias: string | null;
  medicacao: string | null;
  diagnosticos: string | null;
  medicos: MedicoExterno[];
  escola_telefone: string | null;
  escola_turma: string | null;
  escola_professor: string | null;
  escola_coordenacao: string | null;
  escola_observacoes: string | null;
  contato2_nome: string | null;
  contato2_parentesco: string | null;
  contato2_celular: string | null;
  contato2_email: string | null;
  created_at?: string;
  updated_at?: string;
};

export const LIMITACOES = [
  "Cognitiva",
  "Locomoção",
  "Visão",
  "Audição",
  "Outras",
] as const;

export function fichaVazia(pacienteId: string): FichaClinica {
  return {
    paciente_id: pacienteId,
    data_abertura: null,
    especialidades_interesse: [],
    queixa_inicial: null,
    limitacoes: [],
    limitacoes_outras: null,
    alergias: null,
    medicacao: null,
    diagnosticos: null,
    medicos: [],
    escola_telefone: null,
    escola_turma: null,
    escola_professor: null,
    escola_coordenacao: null,
    escola_observacoes: null,
    contato2_nome: null,
    contato2_parentesco: null,
    contato2_celular: null,
    contato2_email: null,
  };
}

export async function getFichaClinica(
  pacienteId: string,
): Promise<FichaClinica | null> {
  const { data, error } = await supabase
    .from("paciente_ficha_clinica")
    .select("*")
    .eq("paciente_id", pacienteId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data as unknown as FichaClinica;
}

export async function upsertFichaClinica(
  ficha: FichaClinica,
): Promise<FichaClinica> {
  const payload = {
    ...ficha,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("paciente_ficha_clinica")
    .upsert(payload, { onConflict: "paciente_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as FichaClinica;
}

export function blocosPreenchidos(f: FichaClinica): { total: number; preenchidos: number } {
  const blocos = [
    f.especialidades_interesse.length > 0 || !!f.queixa_inicial,
    f.limitacoes.length > 0 || !!f.alergias || !!f.medicacao || !!f.diagnosticos,
    f.medicos.length > 0,
    !!f.escola_telefone || !!f.escola_turma || !!f.escola_professor || !!f.escola_coordenacao,
    !!f.contato2_nome,
  ];
  return { total: blocos.length, preenchidos: blocos.filter(Boolean).length };
}