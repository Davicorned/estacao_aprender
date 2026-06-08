import { supabase } from "@/integrations/supabase/client";

export type PeriodoRange = { start: string; end: string };

export function rangeUltimos30(): PeriodoRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function rangeMesAtual(): PeriodoRange {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  return {
    start: new Date(y, m, 1).toISOString().slice(0, 10),
    end: new Date(y, m + 1, 0).toISOString().slice(0, 10),
  };
}

export function rangeMesPassado(): PeriodoRange {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() - 1;
  return {
    start: new Date(y, m, 1).toISOString().slice(0, 10),
    end: new Date(y, m + 1, 0).toISOString().slice(0, 10),
  };
}

export function deslocarRangeAnterior(r: PeriodoRange): PeriodoRange {
  const s = new Date(r.start + "T00:00:00");
  const e = new Date(r.end + "T00:00:00");
  const dias = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  const newEnd = new Date(s);
  newEnd.setDate(newEnd.getDate() - 1);
  const newStart = new Date(newEnd);
  newStart.setDate(newStart.getDate() - dias + 1);
  return {
    start: newStart.toISOString().slice(0, 10),
    end: newEnd.toISOString().slice(0, 10),
  };
}

export type Kpis = {
  pacientes_ativos: number;
  agendamentos_hoje: number;
  sessoes_mes: number;
  receita_mes_centavos: number;
  variacao_pacientes_pct: number | null;
  variacao_agendamentos_pct: number | null;
  variacao_sessoes_pct: number | null;
  variacao_receita_pct: number | null;
};

function pct(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return Math.round(((atual - anterior) / anterior) * 100);
}

export async function fetchKpis(range: PeriodoRange, profissionalId?: string | null): Promise<Kpis> {
  const hoje = new Date().toISOString().slice(0, 10);
  const prev = deslocarRangeAnterior(range);

  const baseAgendamentos = () => {
    let q = supabase.from("agendamentos").select("id", { count: "exact", head: true });
    if (profissionalId) q = q.eq("profissional_id", profissionalId);
    return q;
  };

  const [pacRes, agHojeRes, sessRes, sessPrevRes, lancRes, lancPrevRes] = await Promise.all([
    supabase.from("pacientes").select("id", { count: "exact", head: true }).eq("ativo", true),
    baseAgendamentos().eq("data", hoje),
    baseAgendamentos().eq("status", "atendido").gte("data", range.start).lte("data", range.end),
    baseAgendamentos().eq("status", "atendido").gte("data", prev.start).lte("data", prev.end),
    supabase
      .from("lancamentos_financeiros")
      .select("valor_centavos")
      .eq("tipo", "receita")
      .eq("status", "pago")
      .gte("data_pagamento", range.start)
      .lte("data_pagamento", range.end),
    supabase
      .from("lancamentos_financeiros")
      .select("valor_centavos")
      .eq("tipo", "receita")
      .eq("status", "pago")
      .gte("data_pagamento", prev.start)
      .lte("data_pagamento", prev.end),
  ]);

  const sum = (rows: any[] | null) => (rows ?? []).reduce((s, r) => s + (r.valor_centavos || 0), 0);
  const receitaAtual = sum(lancRes.data as any);
  const receitaPrev = sum(lancPrevRes.data as any);
  const sessAtual = sessRes.count ?? 0;
  const sessPrev = sessPrevRes.count ?? 0;

  return {
    pacientes_ativos: pacRes.count ?? 0,
    agendamentos_hoje: agHojeRes.count ?? 0,
    sessoes_mes: sessAtual,
    receita_mes_centavos: receitaAtual,
    variacao_pacientes_pct: null,
    variacao_agendamentos_pct: null,
    variacao_sessoes_pct: pct(sessAtual, sessPrev),
    variacao_receita_pct: pct(receitaAtual, receitaPrev),
  };
}

export type PontoDia = { data: string; total: number };

export async function atendimentosPorDia(
  range: PeriodoRange,
  profissionalId?: string | null
): Promise<PontoDia[]> {
  let q = supabase
    .from("agendamentos")
    .select("data")
    .eq("status", "atendido")
    .gte("data", range.start)
    .lte("data", range.end);
  if (profissionalId) q = q.eq("profissional_id", profissionalId);

  const { data, error } = await q;
  if (error) {
    console.error("atendimentosPorDia", error);
    return [];
  }

  const map = new Map<string, number>();
  // popular dias do range
  const start = new Date(range.start + "T00:00:00");
  const end = new Date(range.end + "T00:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of data ?? []) {
    const k = (r as any).data as string;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([data, total]) => ({ data, total }));
}

export async function pacientesNovosVsRecorrentes(
  range: PeriodoRange
): Promise<{ novos: number; recorrentes: number }> {
  const { data, error } = await supabase
    .from("pacientes")
    .select("id,created_at")
    .eq("ativo", true);
  if (error) {
    console.error("pacientesNovosVsRecorrentes", error);
    return { novos: 0, recorrentes: 0 };
  }
  let novos = 0;
  let recorrentes = 0;
  const startTs = new Date(range.start + "T00:00:00").getTime();
  const endTs = new Date(range.end + "T23:59:59").getTime();
  for (const p of data ?? []) {
    const t = new Date((p as any).created_at).getTime();
    if (t >= startTs && t <= endTs) novos++;
    else recorrentes++;
  }
  return { novos, recorrentes };
}

export async function proximosAgendamentos(limit = 5) {
  const hoje = new Date().toISOString().slice(0, 10);
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const amanhaStr = amanha.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("agendamentos")
    .select("id,data,hora_inicio,status,paciente:pacientes(id,nome),servico:servicos(id,nome)")
    .in("data", [hoje, amanhaStr])
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("proximosAgendamentos", error);
    return [];
  }
  return data ?? [];
}

export async function proximosLancamentosAReceber(limit = 5) {
  const { data, error } = await supabase
    .from("lancamentos_financeiros")
    .select("id,descricao,valor_centavos,data_vencimento,status,paciente:pacientes(id,nome)")
    .eq("tipo", "receita")
    .eq("status", "pendente")
    .order("data_vencimento", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("proximosLancamentosAReceber", error);
    return [];
  }
  return data ?? [];
}