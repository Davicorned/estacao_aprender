import { supabase } from "@/integrations/supabase/client";

export type Evolucao = {
  id: string;
  paciente_id: string;
  profissional_id: string;
  agendamento_id: string | null;
  data_sessao: string;
  queixa: string | null;
  observacao: string | null;
  evolucao: string | null;
  instrumentos: string | null;
  plano: string | null;
  encaminhamentos: string | null;
  privado: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EvolucaoComJoin = Evolucao & {
  profissional: { id: string; nome: string; titulo: string | null; especialidades: string[]; cor_agenda: string } | null;
  agendamento: { id: string; data: string; hora_inicio: string; servico: { nome: string } | null } | null;
};

export type EvolucaoInput = {
  paciente_id: string;
  profissional_id: string;
  agendamento_id: string | null;
  data_sessao: string;
  queixa: string | null;
  observacao: string | null;
  evolucao: string | null;
  instrumentos: string | null;
  plano: string | null;
  encaminhamentos: string | null;
  privado: boolean;
};

export type PeriodoFiltro = "30d" | "3m" | "6m" | "1a" | "tudo";

export const PERIODO_LABEL: Record<PeriodoFiltro, string> = {
  "30d": "Últimos 30 dias",
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  "1a": "Último ano",
  tudo: "Todo o período",
};

export function dataDesdePeriodo(p: PeriodoFiltro): string | null {
  if (p === "tudo") return null;
  const d = new Date();
  if (p === "30d") d.setDate(d.getDate() - 30);
  if (p === "3m") d.setMonth(d.getMonth() - 3);
  if (p === "6m") d.setMonth(d.getMonth() - 6);
  if (p === "1a") d.setFullYear(d.getFullYear() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const SELECT_JOIN = `*,
  profissional:profissionais(id, nome, titulo, especialidades, cor_agenda),
  agendamento:agendamentos(id, data, hora_inicio, servico:servicos(nome))
`;

export async function listEvolucoes(params: {
  pacienteId: string;
  profissionalId?: string | null;
  periodo?: PeriodoFiltro;
  busca?: string;
}): Promise<EvolucaoComJoin[]> {
  let q = supabase
    .from("evolucoes")
    .select(SELECT_JOIN)
    .eq("paciente_id", params.pacienteId)
    .order("data_sessao", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.profissionalId) q = q.eq("profissional_id", params.profissionalId);
  const desde = dataDesdePeriodo(params.periodo ?? "tudo");
  if (desde) q = q.gte("data_sessao", desde);

  const busca = (params.busca ?? "").trim();
  if (busca.length >= 2) {
    const t = `%${busca}%`;
    q = q.or(
      `queixa.ilike.${t},observacao.ilike.${t},evolucao.ilike.${t},instrumentos.ilike.${t},plano.ilike.${t},encaminhamentos.ilike.${t}`,
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as EvolucaoComJoin[];
}

export async function getEvolucao(id: string): Promise<EvolucaoComJoin | null> {
  const { data, error } = await supabase
    .from("evolucoes")
    .select(SELECT_JOIN)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as EvolucaoComJoin) ?? null;
}

export async function evolucaoByAgendamento(
  agendamentoId: string,
): Promise<Evolucao | null> {
  const { data, error } = await supabase
    .from("evolucoes")
    .select("*")
    .eq("agendamento_id", agendamentoId)
    .maybeSingle();
  if (error) throw error;
  return (data as Evolucao) ?? null;
}

export async function createEvolucao(input: EvolucaoInput): Promise<Evolucao> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("evolucoes")
    .insert({ ...input, created_by: uid })
    .select("*")
    .single();
  if (error) throw error;
  return data as Evolucao;
}

export async function updateEvolucao(
  id: string,
  patch: Partial<EvolucaoInput>,
): Promise<Evolucao> {
  const { data, error } = await supabase
    .from("evolucoes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Evolucao;
}

export async function deleteEvolucao(id: string): Promise<void> {
  const { error } = await supabase.from("evolucoes").delete().eq("id", id);
  if (error) throw error;
}

export async function getProfissionalDoUsuarioLogado(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;
  const { data } = await supabase
    .from("profissionais")
    .select("id")
    .eq("user_id", uid)
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function listProfissionaisAtivos() {
  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome, titulo, especialidades, cor_agenda")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function listAgendamentosDoDiaPaciente(
  pacienteId: string,
  data: string,
) {
  const { data: rows, error } = await supabase
    .from("agendamentos")
    .select("id, hora_inicio, profissional_id, profissional:profissionais(nome), servico:servicos(nome)")
    .eq("paciente_id", pacienteId)
    .eq("data", data)
    .order("hora_inicio");
  if (error) throw error;
  return rows ?? [];
}

export async function listAgendamentosDoPaciente(pacienteId: string) {
  const { data, error } = await supabase
    .from("agendamentos")
    .select(
      `id, data, hora_inicio, hora_fim, status,
       profissional:profissionais(id, nome),
       servico:servicos(id, nome)`,
    )
    .eq("paciente_id", pacienteId)
    .order("data", { ascending: false })
    .order("hora_inicio", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function evolucoesIdsPorAgendamento(pacienteId: string) {
  const { data, error } = await supabase
    .from("evolucoes")
    .select("id, agendamento_id")
    .eq("paciente_id", pacienteId)
    .not("agendamento_id", "is", null);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const r of data ?? []) {
    if (r.agendamento_id) map.set(r.agendamento_id as string, r.id as string);
  }
  return map;
}

export function formatDataBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}