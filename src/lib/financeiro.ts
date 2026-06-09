import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/configuracoes";
import { registrarEvento } from "@/lib/historico";
import { calcularValorMensal, type Contrato } from "@/lib/contratos";

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
  // Buscar pacientes/valores antes do update para o histórico
  const { data: prev } = await supabase
    .from("lancamentos_financeiros")
    .select("id, paciente_id, valor_centavos, descricao")
    .in("id", ids);
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
  for (const l of (prev ?? []) as any[]) {
    if (!l.paciente_id) continue;
    void registrarEvento(
      l.paciente_id,
      "lancamento_pago",
      `Pagamento de ${formatBRL(l.valor_centavos)} registrado (${payload.data_pagamento.split("-").reverse().join("/")})`,
      { lancamento_id: l.id, valor_centavos: l.valor_centavos, forma_pagamento: payload.forma_pagamento },
    );
  }
}

export async function deleteLancamento(id: string): Promise<void> {
  const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);
  if (error) throw error;
}

/** Update genérico de um lançamento. */
export async function updateLancamento(
  id: string,
  patch: Partial<Omit<Lancamento, "id" | "created_at" | "updated_at">>,
): Promise<Lancamento> {
  const { data, error } = await supabase
    .from("lancamentos_financeiros")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lancamento;
}

/** Altera status com efeitos colaterais (limpa pagamento ao voltar p/ pendente). */
export async function alterarStatusLancamento(
  id: string,
  novoStatus: LancamentoStatus,
): Promise<void> {
  const { data: prev } = await supabase
    .from("lancamentos_financeiros")
    .select("id, paciente_id, valor_centavos, status")
    .eq("id", id)
    .maybeSingle();

  const patch: Record<string, any> = {
    status: novoStatus,
    updated_at: new Date().toISOString(),
  };
  if (novoStatus === "pendente" || novoStatus === "cancelado") {
    patch.data_pagamento = null;
    patch.forma_pagamento = null;
  }
  const { error } = await supabase
    .from("lancamentos_financeiros")
    .update(patch)
    .eq("id", id);
  if (error) throw error;

  if (prev && (prev as any).paciente_id) {
    void registrarEvento(
      (prev as any).paciente_id,
      "lancamento_status_alterado",
      `Lançamento de ${formatBRL((prev as any).valor_centavos)} marcado como ${STATUS_LABEL[novoStatus]}`,
      { lancamento_id: id, de: (prev as any).status, para: novoStatus },
    );
  }
}

// =========== Geração de mensalidades a partir de contrato ===========

const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function clampDia(ano: number, mes0: number, dia: number): string {
  const ultimoDia = new Date(ano, mes0 + 1, 0).getDate();
  const d = Math.min(dia, ultimoDia);
  return `${ano}-${String(mes0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Gera 1 lançamento mensal pendente para um contrato pacote_mensal.
 * - primeira=true: usa o mês de data_inicio (ou próximo se dia_vencimento já passou).
 * - primeira=false: gera no mês seguinte à última mensalidade existente
 *   (ou data_inicio se ainda não há nenhuma).
 * Idempotente: não cria se já existe lançamento no mesmo mês de vencimento.
 */
export async function gerarMensalidadeContrato(
  contrato: Pick<
    Contrato,
    | "id"
    | "paciente_id"
    | "modalidade"
    | "dia_vencimento"
    | "aulas_por_mes"
    | "valor_com_desconto_centavos"
    | "forma_pagamento"
    | "data_inicio"
  > & { servico_id?: string | null },
  opts: { primeira?: boolean } = {},
): Promise<{ created: boolean; mes?: string; reason?: string }> {
  if (contrato.modalidade !== "pacote_mensal") return { created: false, reason: "not_mensal" };
  if (!contrato.dia_vencimento) return { created: false, reason: "sem_dia_vencimento" };
  const valor = calcularValorMensal(
    contrato.aulas_por_mes,
    contrato.valor_com_desconto_centavos,
    contrato.forma_pagamento,
  );
  if (valor <= 0) return { created: false, reason: "valor_zero" };

  // Determinar mês alvo
  const inicio = new Date(contrato.data_inicio + "T00:00:00");
  let ano = inicio.getFullYear();
  let mes0 = inicio.getMonth();

  if (opts.primeira) {
    // Se o dia_vencimento já passou no mês de data_inicio, vai pro próximo mês
    if (contrato.dia_vencimento < inicio.getDate()) {
      mes0 += 1;
      if (mes0 > 11) { mes0 = 0; ano += 1; }
    }
  } else {
    // Busca último lançamento gerado e usa mês seguinte
    const { data: existentes } = await supabase
      .from("lancamentos_financeiros")
      .select("data_vencimento")
      .eq("contrato_id", contrato.id)
      .order("data_vencimento", { ascending: false })
      .limit(1);
    const ult = existentes?.[0]?.data_vencimento as string | undefined;
    if (ult) {
      const d = new Date(ult + "T00:00:00");
      ano = d.getFullYear();
      mes0 = d.getMonth() + 1;
      if (mes0 > 11) { mes0 = 0; ano += 1; }
    }
  }

  const dataVenc = clampDia(ano, mes0, contrato.dia_vencimento);
  const inicioMes = `${ano}-${String(mes0 + 1).padStart(2, "0")}-01`;
  const fimMes = `${ano}-${String(mes0 + 1).padStart(2, "0")}-${String(new Date(ano, mes0 + 1, 0).getDate()).padStart(2, "0")}`;

  // Idempotência: já existe lançamento neste mês p/ este contrato?
  const { data: dup } = await supabase
    .from("lancamentos_financeiros")
    .select("id")
    .eq("contrato_id", contrato.id)
    .gte("data_vencimento", inicioMes)
    .lte("data_vencimento", fimMes)
    .limit(1);
  if (dup && dup.length > 0) return { created: false, reason: "ja_existe", mes: `${MESES_PT[mes0]}/${ano}` };

  // Nome do serviço para descrição
  let servicoNome = "atendimento";
  if (contrato.servico_id) {
    const { data: s } = await supabase
      .from("servicos")
      .select("nome")
      .eq("id", contrato.servico_id)
      .maybeSingle();
    if (s?.nome) servicoNome = s.nome;
  }

  const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
  const descricao = `Mensalidade ${servicoNome} — ${MESES_PT[mes0]}/${ano}`;
  const { error } = await supabase.from("lancamentos_financeiros").insert({
    paciente_id: contrato.paciente_id,
    contrato_id: contrato.id,
    agendamento_id: null,
    tipo: "receita",
    descricao,
    valor_centavos: valor,
    data_vencimento: dataVenc,
    data_pagamento: null,
    status: "pendente",
    forma_pagamento: null,
    created_by: userId,
  });
  if (error) throw error;

  void registrarEvento(
    contrato.paciente_id,
    "lancamento_gerado",
    `Mensalidade ${MESES_PT[mes0]}/${ano} gerada — ${formatBRL(valor)}`,
    { contrato_id: contrato.id, valor_centavos: valor, data_vencimento: dataVenc },
  );

  return { created: true, mes: `${MESES_PT[mes0]}/${ano}` };
}

export type ResumoMes = {
  receita_paga_centavos: number;
  a_receber_centavos: number;
  atrasados_centavos: number;
  sessoes_atendidas: number;
};

export async function resumoMes(mes: string, pacienteId?: string | null): Promise<ResumoMes> {
  const { start, end } = mesRange(mes);
  const hoje = new Date().toISOString().slice(0, 10);

  const baseL = () => {
    let q = supabase.from("lancamentos_financeiros").select("valor_centavos").eq("tipo", "receita");
    if (pacienteId) q = q.eq("paciente_id", pacienteId);
    return q;
  };
  const baseA = () => {
    let q = supabase.from("agendamentos").select("id", { count: "exact", head: true }).eq("status", "atendido");
    if (pacienteId) q = q.eq("paciente_id", pacienteId);
    return q;
  };

  const [pagoRes, pendRes, atrasRes, agRes] = await Promise.all([
    baseL().eq("status", "pago").gte("data_pagamento", start).lte("data_pagamento", end),
    baseL().eq("status", "pendente").gte("data_vencimento", start).lte("data_vencimento", end),
    baseL().eq("status", "pendente").lt("data_vencimento", hoje),
    baseA().gte("data", start).lte("data", end),
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

// =========== Sincronização agendamento → lançamento ===========

/** Busca o contrato ativo do paciente que cobre a data; opcionalmente filtra por serviço. */
async function buscarContratoAtivo(
  pacienteId: string,
  servicoId: string | null,
  data: string,
): Promise<{ id: string; valor_centavos: number } | null> {
  let q = supabase
    .from("contratos")
    .select("id, valor_centavos, data_inicio, data_termino")
    .eq("paciente_id", pacienteId)
    .eq("status", "ativo")
    .lte("data_inicio", data)
    .order("data_inicio", { ascending: false });
  if (servicoId) q = q.eq("servico_id", servicoId);
  const { data: rows, error } = await q;
  if (error || !rows?.length) return null;
  const valido = rows.find((r: any) => !r.data_termino || r.data_termino >= data);
  return valido ? { id: valido.id, valor_centavos: valido.valor_centavos } : null;
}

/**
 * Sincroniza lançamento financeiro a partir do status de um agendamento.
 * - status=atendido → cria lançamento (idempotente).
 * - outros status → remove lançamento pendente vinculado; preserva pago.
 */
export async function sincronizarLancamentoDeAgendamento(
  agendamentoId: string,
  novoStatus: string,
): Promise<{ created?: boolean; removed?: boolean; preservedPago?: boolean }> {
  const { data: ag } = await supabase
    .from("agendamentos")
    .select("id, paciente_id, servico_id, data, servico:servicos(nome)")
    .eq("id", agendamentoId)
    .maybeSingle();
  if (!ag) return {};

  const { data: existente } = await supabase
    .from("lancamentos_financeiros")
    .select("id, status")
    .eq("agendamento_id", agendamentoId)
    .maybeSingle();

  if (novoStatus === "atendido") {
    if (existente) return {}; // idempotente
    const contrato = await buscarContratoAtivo(
      (ag as any).paciente_id,
      (ag as any).servico_id,
      (ag as any).data,
    );
    const dataBR = (ag as any).data.split("-").reverse().join("/");
    const servicoNome = (ag as any).servico?.nome ?? "atendimento";
    const prefixo = contrato ? "" : "[Sem contrato] ";
    const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
    const { error } = await supabase.from("lancamentos_financeiros").insert({
      paciente_id: (ag as any).paciente_id,
      contrato_id: contrato?.id ?? null,
      agendamento_id: agendamentoId,
      tipo: "receita",
      descricao: `${prefixo}Sessão ${servicoNome} — ${dataBR}`,
      valor_centavos: contrato?.valor_centavos ?? 0,
      data_vencimento: (ag as any).data,
      data_pagamento: null,
      status: "pendente",
      forma_pagamento: null,
      created_by: userId,
    });
    if (error) throw error;
    return { created: true };
  }

  // Status diferente de atendido
  if (existente) {
    if (existente.status === "pago") return { preservedPago: true };
    const { error } = await supabase
      .from("lancamentos_financeiros")
      .delete()
      .eq("id", existente.id);
    if (error) throw error;
    return { removed: true };
  }
  return {};
}

/** Backfill: para todos atendimentos do mês de um paciente, cria lançamento se faltar. */
export async function backfillLancamentosMes(
  pacienteId: string,
  mes: string,
): Promise<number> {
  const { start, end } = mesRange(mes);
  const { data: ags } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("paciente_id", pacienteId)
    .eq("status", "atendido")
    .gte("data", start)
    .lte("data", end);
  let count = 0;
  for (const a of ags ?? []) {
    const r = await sincronizarLancamentoDeAgendamento(a.id, "atendido");
    if (r.created) count++;
  }
  return count;
}