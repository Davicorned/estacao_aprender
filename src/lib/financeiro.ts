import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/configuracoes";

export type LancamentoStatus = "pendente" | "pago" | "atrasado" | "cancelado";
export type LancamentoTipo = "receita" | "despesa";
export type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "transferencia";

export type Lancamento = {
  id: string;
  paciente_id: string | null;
  contrato_id: string | null;
  agendamento_id: string | null;
  tipo: LancamentoTipo;
  descricao: string;
  valor_centavos: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: LancamentoStatus;
  forma_pagamento: FormaPagamento | null;
  created_at: string;
  updated_at: string;
};

export type LancamentoComJoin = Lancamento & {
  paciente: { id: string; nome: string } | null;
};

export const STATUS_LABEL: Record<LancamentoStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const STATUS_STYLES: Record<LancamentoStatus, string> = {
  pago: "bg-green-100 text-green-700",
  pendente: "bg-amber-100 text-amber-700",
  atrasado: "bg-red-100 text-red-700",
  cancelado: "bg-gray-100 text-gray-500",
};

export const FORMA_LABEL: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao_credito: "Cartão crédito",
  cartao_debito: "Cartão débito",
  transferencia: "Transferência",
};

/** Calcula o status efetivo considerando atrasados dinamicamente. */
export function statusEfetivo(l: Pick<Lancamento, "status" | "data_vencimento">): LancamentoStatus {
  if (l.status === "pendente") {
    const hoje = new Date().toISOString().slice(0, 10);
    if (l.data_vencimento < hoje) return "atrasado";
  }
  return l.status;
}

export { formatBRL };

/** mes = "YYYY-MM" — devolve {start, end} no formato YYYY-MM-DD. */
export function mesRange(mes: string): { start: string; end: string } {
  const [y, m] = mes.split("-").map(Number);
  const start = `${mes}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${mes}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function mesAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const SELECT_JOIN = "*, paciente:pacientes(id,nome)";

export async function listLancamentos(params: {
  mes?: string;
  status?: LancamentoStatus | "todos";
  pacienteId?: string | null;
  tipo?: LancamentoTipo | "todos";
} = {}): Promise<LancamentoComJoin[]> {
  let q = supabase
    .from("lancamentos_financeiros")
    .select(SELECT_JOIN)
    .order("data_vencimento", { ascending: false });

  if (params.mes) {
    const { start, end } = mesRange(params.mes);
    q = q.gte("data_vencimento", start).lte("data_vencimento", end);
  }
  if (params.status && params.status !== "todos") {
    if (params.status === "atrasado") {
      const hoje = new Date().toISOString().slice(0, 10);
      q = q.eq("status", "pendente").lt("data_vencimento", hoje);
    } else {
      q = q.eq("status", params.status);
    }
  }
  if (params.tipo && params.tipo !== "todos") q = q.eq("tipo", params.tipo);
  if (params.pacienteId) q = q.eq("paciente_id", params.pacienteId);

  const { data, error } = await q;
  if (error) {
    console.error("listLancamentos", error);
    return [];
  }
  return (data ?? []) as LancamentoComJoin[];
}

export type LancamentoInput = Omit<Lancamento, "id" | "created_at" | "updated_at">;

export async function createLancamento(input: LancamentoInput): Promise<Lancamento> {
  const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
  const { data, error } = await supabase
    .from("lancamentos_financeiros")
    .insert({ ...input, created_by: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data as Lancamento;
}

export async function registrarPagamento(
  ids: string[],
  payload: { data_pagamento: string; forma_pagamento: FormaPagamento }
): Promise<void> {
  const { error } = await supabase
    .from("lancamentos_financeiros")
    .update({
      status: "pago",
      data_pagamento: payload.data_pagamento,
      forma_pagamento: payload.forma_pagamento,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids);
  if (error) throw error;
}

export async function deleteLancamento(id: string): Promise<void> {
  const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
  if (error) throw error;
}

export type ResumoMes = {
  receita_paga_centavos: number;
  a_receber_centavos: number;
  atrasados_centavos: number;
  sessoes_atendidas: number;
};

export async function resumoMes(mes: string): Promise<ResumoMes> {
  const { start, end } = mesRange(mes);
  const hoje = new Date().toISOString().slice(0, 10);

  const [pagoRes, pendRes, atrasRes, agRes] = await Promise.all([
    supabase
      .from("lancamentos_financeiros")
      .select("valor_centavos")
      .eq("tipo", "receita")
      .eq("status", "pago")
      .gte("data_pagamento", start)
      .lte("data_pagamento", end),
    supabase
      .from("lancamentos_financeiros")
      .select("valor_centavos,data_vencimento")
      .eq("tipo", "receita")
      .eq("status", "pendente")
      .gte("data_vencimento", start)
      .lte("data_vencimento", end),
    supabase
      .from("lancamentos_financeiros")
      .select("valor_centavos")
      .eq("tipo", "receita")
      .eq("status", "pendente")
      .lt("data_vencimento", hoje),
    supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("status", "atendido")
      .gte("data", start)
      .lte("data", end),
  ]);

  const sum = (rows: { valor_centavos: number }[] | null) =>
    (rows ?? []).reduce((s, r) => s + (r.valor_centavos || 0), 0);

  return {
    receita_paga_centavos: sum(pagoRes.data as any),
    a_receber_centavos: sum(pendRes.data as any),
    atrasados_centavos: sum(atrasRes.data as any),
    sessoes_atendidas: agRes.count ?? 0,
  };
}