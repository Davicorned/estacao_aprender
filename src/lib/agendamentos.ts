import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { registrarEvento } from "@/lib/historico";

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
  contrato_id: string | null;
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
  contrato_id?: string | null;
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
  void registrarEvento(
    input.paciente_id,
    "agendamento_criado",
    `Agendamento criado para ${input.data.split("-").reverse().join("/")} às ${input.hora_inicio.slice(0, 5)}`,
    { agendamento_id: (data as Agendamento).id, data: input.data, hora_inicio: input.hora_inicio },
  );
  return data as Agendamento;
}

// =========== Recorrência ===========

export type RecorrenciaTipo =
  | "nao"
  | "semanal"
  | "duas_por_semana"
  | "quinzenal"
  | "mensal";

export type RecorrenciaConfig =
  | { tipo: "nao" }
  | { tipo: "semanal"; ocorrencias: number }
  | { tipo: "duas_por_semana"; ocorrencias: number; segundoDiaSemana: number }
  | { tipo: "quinzenal"; ocorrencias: number }
  | { tipo: "mensal"; ocorrencias: number };

export const RECORRENCIA_LABEL: Record<RecorrenciaTipo, string> = {
  nao: "Não repetir",
  semanal: "Semanal",
  duas_por_semana: "2x por semana",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
};

export const DIAS_SEMANA_LABEL = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

/** Gera as datas (ISO yyyy-mm-dd) de uma recorrência a partir de uma data-base. */
export function ocorrenciasParaRecorrencia(
  dataBase: string,
  cfg: RecorrenciaConfig,
): string[] {
  if (cfg.tipo === "nao") return [dataBase];
  const base = parseIsoDate(dataBase);
  const n = Math.max(1, Math.min(52, cfg.ocorrencias));
  const out: string[] = [];

  if (cfg.tipo === "semanal" || cfg.tipo === "quinzenal") {
    const step = cfg.tipo === "semanal" ? 7 : 14;
    for (let i = 0; i < n; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i * step);
      out.push(toIsoDate(d));
    }
    return out;
  }

  if (cfg.tipo === "mensal") {
    for (let i = 0; i < n; i++) {
      const d = new Date(base);
      d.setMonth(base.getMonth() + i);
      out.push(toIsoDate(d));
    }
    return out;
  }

  // duas_por_semana — alterna entre o dia da semana base e o segundo dia
  const diaA = base.getDay();
  const diaB = cfg.segundoDiaSemana;
  if (diaA === diaB) {
    // cai em semanal
    for (let i = 0; i < n; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i * 7);
      out.push(toIsoDate(d));
    }
    return out;
  }
  let cur = new Date(base);
  out.push(toIsoDate(cur));
  for (let i = 1; i < n; i++) {
    const d = new Date(cur);
    do {
      d.setDate(d.getDate() + 1);
    } while (d.getDay() !== diaA && d.getDay() !== diaB);
    cur = d;
    out.push(toIsoDate(cur));
  }
  return out;
}

/** Calcula nº de ocorrências necessárias até atingir a data ISO `ate` (inclusive). */
export function ocorrenciasAteData(
  dataBase: string,
  ate: string,
  cfg: RecorrenciaConfig,
): number {
  if (cfg.tipo === "nao") return 1;
  const baseT = parseIsoDate(dataBase).getTime();
  const ateT = parseIsoDate(ate).getTime();
  if (ateT < baseT) return 1;
  // estimativa generosa e contagem
  const probe: RecorrenciaConfig = { ...cfg, ocorrencias: 60 } as RecorrenciaConfig;
  const datas = ocorrenciasParaRecorrencia(dataBase, probe);
  let n = 0;
  for (const d of datas) {
    if (parseIsoDate(d).getTime() <= ateT) n++;
    else break;
  }
  return Math.max(1, n);
}

/** Cria agendamentos para um conjunto de datas já validadas pelo usuário. */
export async function createAgendamentosLote(
  baseInput: AgendamentoInput,
  datas: string[],
  opts: { contratoId?: string | null; agrupar?: boolean } = {},
): Promise<{ criados: number }> {
  if (datas.length === 0) return { criados: 0 };
  const grupo = opts.agrupar && datas.length > 1 ? crypto.randomUUID() : null;
  const rows = datas.map((data) => ({
    ...baseInput,
    data,
    contrato_id: opts.contratoId ?? null,
    recorrencia_grupo_id: grupo,
  }));
  const { error } = await supabase.from("agendamentos").insert(rows);
  if (error) throw error;
  const primeira = datas[0].split("-").reverse().join("/");
  const ultima = datas[datas.length - 1].split("-").reverse().join("/");
  void registrarEvento(
    baseInput.paciente_id,
    "agendamento_criado",
    datas.length === 1
      ? `Agendamento criado para ${primeira} às ${baseInput.hora_inicio.slice(0, 5)}`
      : `${datas.length} agendamentos criados (${primeira} a ${ultima}) às ${baseInput.hora_inicio.slice(0, 5)}`,
    { datas, hora_inicio: baseInput.hora_inicio, grupo },
  );
  return { criados: rows.length };
}

/** Verifica em lote quais datas têm conflito para um profissional/horário. */
export async function checarConflitosLote(params: {
  profissionalId: string;
  datas: string[];
  horaInicio: string;
  horaFim: string;
}): Promise<Set<string>> {
  if (params.datas.length === 0) return new Set();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("data, hora_inicio, hora_fim")
    .eq("profissional_id", params.profissionalId)
    .in("data", params.datas)
    .neq("status", "cancelado");
  if (error) throw error;
  const inicio = timeToMin(params.horaInicio);
  const fim = timeToMin(params.horaFim);
  const conflitos = new Set<string>();
  for (const row of data ?? []) {
    const a = timeToMin(row.hora_inicio as string);
    const b = timeToMin(row.hora_fim as string);
    if (inicio < b && fim > a) conflitos.add(row.data as string);
  }
  return conflitos;
}

export async function updateAgendamento(
  id: string,
  patch: Partial<AgendamentoInput>,
): Promise<Agendamento> {
  // Snapshot anterior para detectar remarcação
  let anterior: Agendamento | null = null;
  if (patch.data !== undefined || patch.hora_inicio !== undefined || patch.hora_fim !== undefined) {
    const { data: prev } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    anterior = (prev as Agendamento) ?? null;
  }
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  if (anterior) {
    const novaData = patch.data ?? anterior.data;
    const novaHora = patch.hora_inicio ?? anterior.hora_inicio;
    const mudouData = patch.data !== undefined && patch.data !== anterior.data;
    const mudouHora =
      (patch.hora_inicio !== undefined && patch.hora_inicio !== anterior.hora_inicio) ||
      (patch.hora_fim !== undefined && patch.hora_fim !== anterior.hora_fim);
    if (mudouData || mudouHora) {
      const de = `${anterior.data.split("-").reverse().join("/")} ${anterior.hora_inicio.slice(0, 5)}`;
      const para = `${novaData.split("-").reverse().join("/")} ${novaHora.slice(0, 5)}`;
      void registrarEvento(
        anterior.paciente_id,
        "agendamento_remarcado",
        `Remarcado de ${de} para ${para}`,
        {
          agendamento_id: id,
          de: { data: anterior.data, hora_inicio: anterior.hora_inicio, hora_fim: anterior.hora_fim },
          para: { data: novaData, hora_inicio: novaHora, hora_fim: patch.hora_fim ?? anterior.hora_fim },
        },
      );
    }
  }
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
  if (status === "cancelado" || status === "atendido" || status === "faltou") {
    try {
      const { data: ag } = await supabase
        .from("agendamentos")
        .select("paciente_id, data, hora_inicio")
        .eq("id", id)
        .maybeSingle();
      if (ag) {
        const dataFmt = (ag as any).data.split("-").reverse().join("/");
        const hora = ((ag as any).hora_inicio as string).slice(0, 5);
        const tipo =
          status === "cancelado"
            ? "agendamento_cancelado"
            : status === "atendido"
              ? "agendamento_atendido"
              : "agendamento_faltou";
        const label =
          status === "cancelado"
            ? `Cancelado (${dataFmt} ${hora})${motivoCancelamento ? " — " + motivoCancelamento : ""}`
            : status === "atendido"
              ? `Sessão atendida em ${dataFmt} às ${hora}`
              : `Falta registrada em ${dataFmt} às ${hora}`;
        void registrarEvento((ag as any).paciente_id, tipo as any, label, {
          agendamento_id: id,
          motivo: motivoCancelamento ?? null,
        });
      }
    } catch (e) {
      console.error("registrar historico status", e);
    }
  }
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