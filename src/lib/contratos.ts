import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/configuracoes";

export type ContratoStatus = "rascunho" | "ativo" | "encerrado" | "cancelado";
export type Frequencia = "semanal" | "quinzenal" | "mensal" | "livre";

export type Contrato = {
  id: string;
  paciente_id: string;
  profissional_id: string;
  servico_id: string;
  valor_centavos: number;
  qtd_sessoes: number | null;
  frequencia: Frequencia;
  data_inicio: string;
  data_termino: string | null;
  status: ContratoStatus;
  termos: string;
  template_origem: string | null;
  created_at: string;
  updated_at: string;
};

export type ContratoComJoin = Contrato & {
  paciente: { id: string; nome: string; telefone_celular: string | null; responsaveis: any } | null;
  profissional: { id: string; nome: string } | null;
  servico: { id: string; nome: string } | null;
};

export type ContratoInput = Omit<Contrato, "id" | "created_at" | "updated_at">;

export const FREQUENCIA_LABEL: Record<Frequencia, string> = {
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
  livre: "Livre",
};

export const STATUS_LABEL: Record<ContratoStatus, string> = {
  rascunho: "Rascunho",
  ativo: "Ativo",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const STATUS_STYLES: Record<ContratoStatus, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  ativo: "bg-green-100 text-green-700",
  encerrado: "bg-blue-100 text-blue-700",
  cancelado: "bg-red-100 text-red-700",
};

export const TEMPLATE_PADRAO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Pelo presente instrumento, a ESTAÇÃO APRENDER, representada por Érica Cornedi,
e o(a) contratante {{NOME_RESPONSAVEL}}, responsável pelo(a) menor {{NOME_PACIENTE}},
acordam os seguintes termos:

1. SERVIÇO: {{TIPO_SERVICO}}
2. VALOR: {{VALOR}} por sessão
3. FREQUÊNCIA: {{FREQUENCIA}}
4. QUANTIDADE DE SESSÕES: {{QTD_SESSOES}}
5. INÍCIO: {{DATA_INICIO}}
6. TÉRMINO: {{DATA_TERMINO}}

7. As sessões deverão ser remarcadas com no mínimo 24h de antecedência;
   sessões canceladas com menos de 24h serão cobradas integralmente.

8. O pagamento será efetuado mensalmente, conforme as sessões realizadas.

9. O contratante declara estar ciente e de acordo com a metodologia e o
   plano terapêutico proposto pelo(a) profissional responsável.

_________________________________
Érica Cornedi — Estação Aprender

_________________________________
{{NOME_RESPONSAVEL}}
`;

export type TemplateVars = {
  NOME_PACIENTE: string;
  NOME_RESPONSAVEL: string;
  TIPO_SERVICO: string;
  VALOR: string;
  FREQUENCIA: string;
  QTD_SESSOES: string;
  DATA_INICIO: string;
  DATA_TERMINO: string;
};

export function aplicarTemplate(template: string, vars: Partial<TemplateVars>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = (vars as any)[key];
    return v ?? `{{${key}}}`;
  });
}

export function calcularDataTermino(
  dataInicio: string,
  qtd: number | null,
  freq: Frequencia
): string | null {
  if (!dataInicio || !qtd || qtd <= 0 || freq === "livre") return null;
  const d = new Date(dataInicio + "T00:00:00");
  const incDias = freq === "semanal" ? 7 : freq === "quinzenal" ? 14 : 30;
  d.setDate(d.getDate() + incDias * (qtd - 1));
  return d.toISOString().slice(0, 10);
}

export function formatData(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export { formatBRL };

export function whatsappLink(numero: string | null, mensagem: string): string {
  const digits = (numero ?? "").replace(/\D/g, "");
  const full = digits.length >= 11 ? `55${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(mensagem)}`;
}

const SELECT_JOIN =
  "*, paciente:pacientes(id,nome,telefone_celular,responsaveis), profissional:profissionais(id,nome), servico:servicos(id,nome)";

export async function listContratos(params: {
  status?: ContratoStatus | "todos";
  profissionalId?: string | "todos";
} = {}): Promise<ContratoComJoin[]> {
  let q = supabase.from("contratos").select(SELECT_JOIN).order("created_at", { ascending: false });
  if (params.status && params.status !== "todos") q = q.eq("status", params.status);
  if (params.profissionalId && params.profissionalId !== "todos")
    q = q.eq("profissional_id", params.profissionalId);
  const { data, error } = await q;
  if (error) {
    console.error("listContratos", error);
    return [];
  }
  return (data ?? []) as ContratoComJoin[];
}

export async function getContrato(id: string): Promise<ContratoComJoin | null> {
  const { data, error } = await supabase.from("contratos").select(SELECT_JOIN).eq("id", id).maybeSingle();
  if (error) {
    console.error("getContrato", error);
    return null;
  }
  return data as ContratoComJoin | null;
}

export async function createContrato(input: ContratoInput): Promise<Contrato> {
  const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
  const { data, error } = await supabase
    .from("contratos")
    .insert({ ...input, created_by: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data as Contrato;
}

export async function updateContrato(id: string, patch: Partial<ContratoInput>): Promise<Contrato> {
  const { data, error } = await supabase
    .from("contratos")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Contrato;
}

export async function deleteContrato(id: string): Promise<void> {
  const { error } = await supabase.from("contratos").delete().eq("id", id);
  if (error) throw error;
}