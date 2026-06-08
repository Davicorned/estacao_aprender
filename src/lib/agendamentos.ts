import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AgendamentoStatus =
  | "agendado"
  | "confirmado"
  | "em_atendimento"
  | "atendido"
  | "faltou"
  | "cancelado";

export type AgendamentoTipo = "presencial" | "online";

export type Agendamento = {
  id: string;
  paciente_id: string;
  profissional_id: string;
  servico_id: string | null;
  data: string; // yyyy-mm-dd
  hora_inicio: string; // HH:MM[:SS]
  hora_fim: string;
  tipo: AgendamentoTipo;
  status: AgendamentoStatus;
  observacoes: string | null;
  motivo_cancelamento: string | null;
  recorrencia_grupo_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AgendamentoComJoin = Agendamento & {
  paciente: { id: string; nome: string; foto_url: string | null } | null;
  servico: { id: string; nome: string; duracao_min: number } | null;
  profissional: { id: string; nome: string; cor_agenda: string } | null;
};

export type AgendamentoInput = {
  paciente_id: string;
  profissional_id: string;
  servico_id: string | null;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: AgendamentoTipo;
  observacoes: string | null;
};

// =========== Constantes ===========

export const SLOT_MIN = 15;
export const SLOT_HEIGHT = 40; // px por slot de 15min
export const HORA_INICIO = "08:00";
export const HORA_FIM = "18:00";

export const STATUS_LABEL: Record<AgendamentoStatus, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_atendimento: "Em atendimento",
  atendido: "Atendido",
  faltou: "Faltou",
  cancelado: "Cancelado",
};

export const STATUS_STYLES: Record<AgendamentoStatus, string> = {
  agendado: "bg-amber-100 border-amber-400 text-amber-900",
  confirmado: "bg-blue-100 border-blue-400 text-blue-900",
  em_atendimento: "bg-[#FEF3E8] border-[#D67F43] text-[#7A3B14]",
  atendido: "bg-green-100 border-green-400 text-green-900",
  faltou: "bg-red-100 border-red-400 text-red-900",
  cancelado: "bg-gray-100 border-gray-300 text-gray-500 opacity-60",
};

// =========== Helpers de data/hora ===========

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfWeekSunday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function semanaDe(d: Date): Date[] {
  const start = startOfWeekSunday(d);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x;
  });
}

export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addMin(time: string, n: number): string {
  return minToTime(timeToMin(time) + n);
}

export function slotsDoDia(): string[] {
  const start = timeToMin(HORA_INICIO);
  const end = timeToMin(HORA_FIM);
  const out: string[] = [];
  for (let m = start; m < end; m += SLOT_MIN) out.push(minToTime(m));
  return out;
}

export function totalSlotsDia(): number {
  return Math.ceil((timeToMin(HORA_FIM) - timeToMin(HORA_INICIO)) / SLOT_MIN);
}

/** Posição/altura em pixels de um agendamento dentro da coluna. */
export function blocoPosicao(horaInicio: string, horaFim: string) {
  const baseMin = timeToMin(HORA_INICIO);
  const top = ((timeToMin(horaInicio) - baseMin) / SLOT_MIN) * SLOT_HEIGHT;
  const altura = Math.max(
    SLOT_HEIGHT,
    ((timeToMin(horaFim) - timeToMin(horaInicio)) / SLOT_MIN) * SLOT_HEIGHT,
  );
  return { top, altura };
}

export function diasIguais(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function labelDia(d: Date): string {
  return `${DIAS_SEMANA[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}`;
}

export function labelDiaLongo(d: Date): string {
  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// =========== Queries ===========

const SELECT_JOIN = `*,
  paciente:pacientes(id, nome, foto_url),
  servico:servicos(id, nome, duracao_min),
  profissional:profissionais(id, nome, cor_agenda)
`;

export async function listAgendamentosByRange(params: {
  dataInicio: string;
  dataFim: string;
  profissionalId?: string | null;
}): Promise<AgendamentoComJoin[]> {
  let q = supabase
    .from("agendamentos")
    .select(SELECT_JOIN)
    .gte("data", params.dataInicio)
    .lte("data", params.dataFim)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });
  if (params.profissionalId) q = q.eq("profissional_id", params.profissionalId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as AgendamentoComJoin[];
}

export async function getAgendamento(id: string): Promise<AgendamentoComJoin | null> {
  const { data, error } = await supabase
    .from("agendamentos")
    .select(SELECT_JOIN)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AgendamentoComJoin) ?? null;
}

export async function checarConflito(params: {
  profissionalId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  excludeId?: string;
}): Promise<boolean> {
  let q = supabase
    .from("agendamentos")
    .select("id, hora_inicio, hora_fim")
    .eq("profissional_id", params.profissionalId)
    .eq("data", params.data)
    .neq("status", "cancelado");
  if (params.excludeId) q = q.neq("id", params.excludeId);
  const { data, error } = await q;
  if (error) throw error;
  const inicio = timeToMin(params.horaInicio);
  const fim = timeToMin(params.horaFim);
  return (data ?? []).some((row) => {
    const a = timeToMin(row.hora_inicio as string);
    const b = timeToMin(row.hora_fim as string);
    return inicio < b && fim > a; // overlap
  });
}

export async function createAgendamento(input: AgendamentoInput): Promise<Agendamento> {
  const { data, error } = await supabase
    .from("agendamentos")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Agendamento;
}

export type Recorrencia = "nao" | "semanal" | "quinzenal" | "mensal";

export function ocorrenciasParaRecorrencia(
  dataBase: string,
  rec: Recorrencia,
): string[] {
  if (rec === "nao") return [dataBase];
  const base = parseIsoDate(dataBase);
  const out: string[] = [];
  if (rec === "semanal" || rec === "quinzenal") {
    const stepDias = rec === "semanal" ? 7 : 14;
    for (let i = 0; i < 4; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i * stepDias);
      out.push(toIsoDate(d));
    }
  } else if (rec === "mensal") {
    for (let i = 0; i < 3; i++) {
      const d = new Date(base);
      d.setMonth(base.getMonth() + i);
      out.push(toIsoDate(d));
    }
  }
  return out;
}

export async function createAgendamentosRecorrentes(
  input: AgendamentoInput,
  rec: Recorrencia,
): Promise<{ criados: number; conflitos: string[] }> {
  const datas = ocorrenciasParaRecorrencia(input.data, rec);
  const grupo = rec === "nao" ? null : crypto.randomUUID();
  const conflitos: string[] = [];
  const rows: (AgendamentoInput & { recorrencia_grupo_id: string | null })[] = [];
  for (const data of datas) {
    const conf = await checarConflito({
      profissionalId: input.profissional_id,
      data,
      horaInicio: input.hora_inicio,
      horaFim: input.hora_fim,
    });
    if (conf) {
      conflitos.push(data);
      continue;
    }
    rows.push({ ...input, data, recorrencia_grupo_id: grupo });
  }
  if (rows.length === 0) return { criados: 0, conflitos };
  const { error } = await supabase.from("agendamentos").insert(rows);
  if (error) throw error;
  return { criados: rows.length, conflitos };
}

export async function updateAgendamento(
  id: string,
  patch: Partial<AgendamentoInput>,
): Promise<Agendamento> {
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Agendamento;
}

export async function updateStatus(
  id: string,
  status: AgendamentoStatus,
  motivoCancelamento?: string,
): Promise<void> {
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "cancelado" && motivoCancelamento) {
    patch.motivo_cancelamento = motivoCancelamento;
  }
  const { error } = await supabase.from("agendamentos").update(patch).eq("id", id);
  if (error) throw error;
  try {
    const { sincronizarLancamentoDeAgendamento } = await import("@/lib/financeiro");
    await sincronizarLancamentoDeAgendamento(id, status);
  } catch (e) {
    console.error("sincronizarLancamentoDeAgendamento falhou", e);
  }
}

export async function deleteAgendamento(id: string): Promise<void> {
  const { error } = await supabase.from("agendamentos").delete().eq("id", id);
  if (error) throw error;
}

export async function searchPacientesQuick(term: string, limit = 8) {
  const t = term.trim();
  if (t.length < 2) return [];
  const { data, error } = await supabase
    .from("pacientes")
    .select("id, nome, foto_url, telefone_celular")
    .ilike("nome", `%${t}%`)
    .eq("ativo", true)
    .order("nome")
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =========== Realtime ===========

export function useAgendamentosRealtime(queryKeyPrefix: unknown[] = ["agendamentos"]) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("agendamentos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos" },
        () => {
          void qc.invalidateQueries({ queryKey: queryKeyPrefix });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}