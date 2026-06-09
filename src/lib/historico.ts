import { supabase } from "@/integrations/supabase/client";

export type HistoricoTipo =
  | "paciente_criado"
  | "paciente_editado"
  | "agendamento_criado"
  | "agendamento_remarcado"
  | "agendamento_cancelado"
  | "agendamento_atendido"
  | "agendamento_faltou"
  | "contrato_criado"
  | "contrato_encerrado"
  | "evolucao_registrada"
  | "lancamento_pago"
  | "comentario";

export type HistoricoCategoria =
  | "agendamento"
  | "clinico"
  | "financeiro"
  | "cadastro"
  | "comentario";

export type HistoricoEvento = {
  id: string;
  paciente_id: string;
  tipo: HistoricoTipo;
  descricao: string;
  metadata: Record<string, any>;
  autor_id: string | null;
  autor_nome: string | null;
  created_at: string;
};

export const TIPO_LABEL: Record<HistoricoTipo, string> = {
  paciente_criado: "Paciente cadastrado",
  paciente_editado: "Dados atualizados",
  agendamento_criado: "Agendamento criado",
  agendamento_remarcado: "Agendamento remarcado",
  agendamento_cancelado: "Agendamento cancelado",
  agendamento_atendido: "Sessão atendida",
  agendamento_faltou: "Falta registrada",
  contrato_criado: "Contrato criado",
  contrato_encerrado: "Contrato encerrado",
  evolucao_registrada: "Evolução registrada",
  lancamento_pago: "Pagamento registrado",
  comentario: "Comentário",
};

export function categoriaDoTipo(tipo: HistoricoTipo): HistoricoCategoria {
  if (tipo.startsWith("agendamento_")) return "agendamento";
  if (tipo === "evolucao_registrada") return "clinico";
  if (tipo === "lancamento_pago") return "financeiro";
  if (tipo === "comentario") return "comentario";
  if (tipo === "contrato_criado" || tipo === "contrato_encerrado") return "financeiro";
  return "cadastro";
}

async function getAutor(): Promise<{ id: string | null; nome: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return { id: null, nome: null };
    const { data: prof } = await supabase
      .from("profissionais")
      .select("nome")
      .eq("user_id", user.id)
      .maybeSingle();
    const nome = (prof as any)?.nome ?? user.email ?? null;
    return { id: user.id, nome };
  } catch {
    return { id: null, nome: null };
  }
}

export async function registrarEvento(
  pacienteId: string,
  tipo: HistoricoTipo,
  descricao: string,
  metadata: Record<string, any> = {},
): Promise<void> {
  if (!pacienteId) return;
  try {
    const autor = await getAutor();
    await supabase.from("paciente_historico").insert({
      paciente_id: pacienteId,
      tipo,
      descricao,
      metadata,
      autor_id: autor.id,
      autor_nome: autor.nome,
    });
  } catch (e) {
    console.error("registrarEvento falhou", e);
  }
}

export async function registrarComentario(pacienteId: string, texto: string): Promise<void> {
  const t = texto.trim();
  if (!t) return;
  await registrarEvento(pacienteId, "comentario", t);
}

export type ListHistoricoParams = {
  pacienteId: string;
  categoria?: HistoricoCategoria | "todos";
  limit?: number;
};

export async function listHistorico(params: ListHistoricoParams): Promise<HistoricoEvento[]> {
  const { pacienteId, categoria = "todos", limit = 200 } = params;
  let q = supabase
    .from("paciente_historico")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as unknown as HistoricoEvento[];
  if (categoria === "todos") return rows;
  return rows.filter((r) => categoriaDoTipo(r.tipo) === categoria);
}

/** Conta pacientes distintos com pelo menos 1 remarcação no período. */
export async function countPacientesRemarcados(
  range: { start: string; end: string },
): Promise<number> {
  const { data, error } = await supabase
    .from("paciente_historico")
    .select("paciente_id")
    .eq("tipo", "agendamento_remarcado")
    .gte("created_at", `${range.start}T00:00:00`)
    .lte("created_at", `${range.end}T23:59:59`);
  if (error) {
    console.error("countPacientesRemarcados", error);
    return 0;
  }
  const set = new Set<string>();
  for (const r of data ?? []) set.add((r as any).paciente_id);
  return set.size;
}