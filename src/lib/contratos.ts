import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/configuracoes";

export type ContratoStatus = "rascunho" | "ativo" | "encerrado" | "cancelado";
export type Frequencia = "semanal" | "quinzenal" | "mensal" | "livre";
export type Modalidade = "pacote_mensal" | "avulso";
export type FormaPagamento =
  | "pix"
  | "transferencia"
  | "boleto"
  | "debito"
  | "cartao_credito";

export type DadosResponsavel = {
  nome?: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
};

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
  arquivo_assinado_path: string | null;
  arquivo_assinado_uploaded_at: string | null;
  arquivo_assinado_mime: string | null;
  modalidade: Modalidade | null;
  aulas_por_mes: number | null;
  valor_com_desconto_centavos: number | null;
  valor_sem_desconto_centavos: number | null;
  forma_pagamento: FormaPagamento | null;
  dia_vencimento: number | null;
  cidade_assinatura: string | null;
  dados_responsavel: DadosResponsavel | null;
  autoriza_imagem: boolean | null;
  observacoes: string | null;
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

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  pacote_mensal: "Pacote Mensal",
  avulso: "Avulso",
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: "PIX",
  transferencia: "Transferência bancária",
  boleto: "Boleto",
  debito: "Débito (presencial)",
  cartao_credito: "Cartão de crédito",
};

export const ACRESCIMO_CARTAO_CENTAVOS = 1000; // R$ 10,00 por aula

/** Calcula valor mensal do pacote considerando acréscimo de cartão. */
export function calcularValorMensal(
  aulas: number | null,
  valorComDesconto: number | null,
  formaPagamento: FormaPagamento | null,
): number {
  if (!aulas || !valorComDesconto) return 0;
  const acresc = formaPagamento === "cartao_credito" ? ACRESCIMO_CARTAO_CENTAVOS : 0;
  return aulas * (valorComDesconto + acresc);
}

export const TEMPLATE_PADRAO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PEDAGÓGICOS

São partes no presente instrumento particular de Contrato de Prestação de Serviço Profissional, de um lado, como CONTRATADA:

1. DAS PARTES

Erica Roberta Alves da Silva Cornedi, portadora do RG 29.101.536-0, CPF 282.662.518-78, com endereço comercial em Praça Gajé, 56, Conj. 1 – Engenheiro Goulart – SP. Como CONTRATANTE {{NOME_RESPONSAVEL}}, residente em {{ENDERECO_RESPONSAVEL}}, portador(a) do CPF {{CPF_RESPONSAVEL}}{{RG_RESPONSAVEL_LINHA}}, denominado(a) neste como responsável legal ou financeiro de {{NOME_PACIENTE}}, denominado(a) neste como beneficiário(a), firmam contrato de prestação de serviços educacionais, que será realizado conforme as cláusulas a seguir.

2. DO OBJETO DO CONTRATO

2.1 O OBJETO do presente instrumento é a prestação de serviços educacionais (aulas particulares, reforço escolar, acompanhamento escolar e demais atividades voltadas às necessidades do(a) aprendente).

2.2 O(a) aprendente participará das aulas na modalidade presencial nos dias e horários estabelecidos entre as partes contratantes. As aulas terão duração de 50 minutos cada. Não sendo possível estender o horário para além do previsto, mesmo em caso de atraso do aluno.

3. PAGAMENTO

3.1 É de responsabilidade do CONTRATANTE efetuar o pagamento de acordo com as formas e condições estabelecidas no presente contrato.

Quantidade de aulas contratadas: {{AULAS_POR_MES}} aulas mensais
Valor de cada aula com desconto: {{VALOR_COM_DESCONTO}}     Pacote Mensal {{MARCA_PACOTE}}
Valor de cada aula sem desconto: {{VALOR_SEM_DESCONTO}}     Avulso {{MARCA_AVULSO}}
Forma de pagamento escolhida: {{FORMA_PAGAMENTO}}
Valor mensal do pacote: {{VALOR_MENSAL}}

3.2 O contratante terá desconto de R$ 15,00 em cada aula ao optar pelo pagamento mensal através de PIX, transferência bancária, boleto ou débito presencialmente. Caso o contratante opte pelo pagamento através de cartão de crédito haverá acréscimo de R$ 10,00 em cada aula.

3.3 O contratante que optar pelo pagamento mensal deverá efetuar o pagamento do pacote sempre no dia {{DIA_VENCIMENTO}} de cada mês para garantir o desconto no pacote. Em caso de atraso no pagamento, o CONTRATANTE perderá o desconto em cada aula e o valor da mesma e do pacote será atualizado sem o desconto.

3.4 Os atendimentos somente ocorrerão mediante ao pagamento efetuado pelo contratante.

3.5 Quando houver feriado em data de atendimento, haverão duas opções: aula reagendada ou não haverá a aula e a mesma será descontada do pacote. E quando ocorrer do mês ter 5 semanas, ficará a critério da família incluir esta aula no cronograma ou não.

4. DESISTÊNCIA

4.1 Não será cobrado nenhum valor adicional em caso de desistência, porém, se ocorrer após o pagamento já ter sido realizado por parte do(a) CONTRATANTE, o valor não será devolvido e não obriga a CONTRATADA devolução dos valores pagos.

5. FÉRIAS E RECESSO

No período de férias será cobrado o valor do pacote normalmente referente ao período de 4 semanas para que possamos assegurar a vaga do aprendente durante a sua ausência. Caso o responsável opte por não realizar o pagamento do mesmo, não será possível assegurar a vaga do aprendente ao retorno das aulas.

Obs.: Qualquer alteração ou reajuste no contrato somente poderá acontecer com conhecimento e acordo entre as partes.

6. FALTAS, ATRASOS E REAGENDAMENTOS

Se porventura a CONTRATADA desmarque algum encontro por motivos particulares, a CONTRATANTE terá o direito de reposição do encontro com dia e hora a serem acordados entre as partes.

A CONTRATADA deverá iniciar todos os encontros pontualmente no horário pré-estabelecido. Qualquer eventual atraso por parte da CONTRATADA fica assegurado ao CONTRATANTE o direito de exigir a compensação do tempo equivalente ao atraso, que poderá ser coberto no mesmo dia ou em data a ser definida.

Mudanças de horário só serão possíveis quando houver disponibilidade da profissional. A CONTRATANTE tem o prazo de até 2 (duas) horas que antecedem o horário pré-estabelecido dos encontros, para comunicar eventual falta.

Em casos de reagendamento, só ocorrerão mediante a justificativa médica ou escolar de suma importância que necessite sua falta ao atendimento particular.

A CONTRATADA se compromete a repor o horário do encontro em dia a ser combinado, preferencialmente na mesma semana, de tal forma que o(a) aprendente não fique prejudicado.

Caso a falta do aprendente não seja justificada de acordo com os critérios acima, não haverá reembolso da aula e a mesma não poderá ser remarcada para outra data.

Em caso de viagem, passeio ou qualquer outro motivo para a falta do aprendente, o(a) responsável deverá informar para a CONTRATADA antes de realizar o pagamento do pacote para que esta data não seja contabilizada, pois após efetuar o pagamento a falta só será reagendada ou ressarcida mediante a justificativa médica ou escolar.
`;

export const TEMPLATE_ASSINATURA = `Eu, {{NOME_RESPONSAVEL}}, CPF {{CPF_RESPONSAVEL}}, responsável por {{NOME_PACIENTE}}, li e concordo com a natureza e a finalidade deste documento.

{{CIDADE}}, {{DATA_HOJE}}.

_____________________________________
{{NOME_RESPONSAVEL}}
Responsável`;

export const TEMPLATE_AUTORIZACAO_IMAGEM = `AUTORIZAÇÃO DE USO DE IMAGEM

Eu, {{NOME_RESPONSAVEL}}, inscrito(a) no CPF sob o n° {{CPF_RESPONSAVEL}}, responsável de {{NOME_PACIENTE}}, {{MARCA_AUTORIZA}} autorizo / {{MARCA_NAO_AUTORIZA}} não autorizo o uso de sua imagem em materiais como fotos ou vídeos para serem utilizados em mídias sociais da Estação Aprender, com sede em Praça Gajé n° 56, Conj. 1.

A presente autorização é concedida a título gratuito, abrangendo o uso da imagem acima mencionada para mídias sociais, em destaque: Instagram e Facebook.

Por esta ser a expressão da minha vontade, declaro que: {{MARCA_AUTORIZA}} autorizo / {{MARCA_NAO_AUTORIZA}} não autorizo o uso acima descrito da imagem de meu(minha) filho(a), sem que nada haja a ser reclamado a título de direitos conexos à sua imagem ou qualquer outro, e assino o presente instrumento em 01 (uma) via de igual teor e forma.

{{CIDADE}}, {{DATA_HOJE}}.

_____________________________________
{{NOME_RESPONSAVEL}}`;

export type TemplateVars = Record<string, string>;

function maskCheckbox(checked: boolean): string {
  return checked ? "(X)" : "( )";
}

function hoje(): string {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, "0");
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${dia} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export type MontarVarsInput = {
  paciente_nome: string;
  responsavel: DadosResponsavel | null;
  servico_nome: string;
  modalidade: Modalidade | null;
  aulas_por_mes: number | null;
  valor_com_desconto_centavos: number | null;
  valor_sem_desconto_centavos: number | null;
  forma_pagamento: FormaPagamento | null;
  dia_vencimento: number | null;
  cidade_assinatura: string | null;
  autoriza_imagem: boolean | null;
  data_inicio: string;
  data_termino: string | null;
  frequencia: Frequencia;
  qtd_sessoes: number | null;
};

export function montarVariaveis(input: MontarVarsInput): TemplateVars {
  const valorMensal = calcularValorMensal(
    input.aulas_por_mes,
    input.valor_com_desconto_centavos,
    input.forma_pagamento,
  );
  const rg = input.responsavel?.rg?.trim();
  return {
    NOME_PACIENTE: input.paciente_nome || "________________",
    NOME_RESPONSAVEL: input.responsavel?.nome?.trim() || "________________",
    CPF_RESPONSAVEL: input.responsavel?.cpf?.trim() || "________________",
    RG_RESPONSAVEL_LINHA: rg ? `, RG ${rg}` : "",
    ENDERECO_RESPONSAVEL: input.responsavel?.endereco?.trim() || "________________",
    TIPO_SERVICO: input.servico_nome || "________________",
    AULAS_POR_MES: input.aulas_por_mes ? String(input.aulas_por_mes) : "____",
    VALOR_COM_DESCONTO: formatBRL(input.valor_com_desconto_centavos ?? 0),
    VALOR_SEM_DESCONTO: formatBRL(input.valor_sem_desconto_centavos ?? 0),
    VALOR_MENSAL: formatBRL(valorMensal),
    FORMA_PAGAMENTO: input.forma_pagamento ? FORMA_PAGAMENTO_LABEL[input.forma_pagamento] : "________________",
    DIA_VENCIMENTO: input.dia_vencimento ? String(input.dia_vencimento) : "____",
    MARCA_PACOTE: maskCheckbox(input.modalidade === "pacote_mensal"),
    MARCA_AVULSO: maskCheckbox(input.modalidade === "avulso"),
    MARCA_AUTORIZA: maskCheckbox(input.autoriza_imagem === true),
    MARCA_NAO_AUTORIZA: maskCheckbox(input.autoriza_imagem === false),
    FREQUENCIA: FREQUENCIA_LABEL[input.frequencia],
    QTD_SESSOES: input.qtd_sessoes ? String(input.qtd_sessoes) : "Indeterminado",
    DATA_INICIO: formatData(input.data_inicio),
    DATA_TERMINO: input.data_termino ? formatData(input.data_termino) : "—",
    CIDADE: input.cidade_assinatura?.trim() || "São Paulo",
    DATA_HOJE: hoje(),
  };
}

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
  "*, paciente:pacientes!contratos_paciente_id_fkey(id,nome,telefone_celular,responsaveis), profissional:profissionais!contratos_profissional_id_fkey(id,nome), servico:servicos!contratos_servico_id_fkey(id,nome)";

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
  const { data, error } = await supabase
    .from("contratos")
    .insert(input)
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

// ============================================================
// Contrato assinado (scan) — bucket privado `contratos-assinados`
// ============================================================

export const CONTRATOS_ASSINADOS_BUCKET = "contratos-assinados";
export const ARQUIVO_ASSINADO_MIMES = ["application/pdf", "image/jpeg", "image/png"];
export const ARQUIVO_ASSINADO_MAX_BYTES = 10 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
}

export async function uploadContratoAssinado(contratoId: string, file: File): Promise<string> {
  if (!ARQUIVO_ASSINADO_MIMES.includes(file.type)) {
    throw new Error("Formato inválido. Use PDF, JPG ou PNG.");
  }
  if (file.size > ARQUIVO_ASSINADO_MAX_BYTES) {
    throw new Error("Arquivo maior que 10MB.");
  }

  // Busca path anterior para remover depois
  const { data: prev } = await supabase
    .from("contratos")
    .select("arquivo_assinado_path")
    .eq("id", contratoId)
    .maybeSingle();

  const path = `${contratoId}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const { error: upErr } = await supabase.storage
    .from(CONTRATOS_ASSINADOS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;

  const { error: updErr } = await supabase
    .from("contratos")
    .update({
      arquivo_assinado_path: path,
      arquivo_assinado_uploaded_at: new Date().toISOString(),
      arquivo_assinado_mime: file.type,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contratoId);
  if (updErr) throw updErr;

  // Remove anterior (best-effort)
  const prevPath = (prev as any)?.arquivo_assinado_path as string | null | undefined;
  if (prevPath && prevPath !== path) {
    await supabase.storage.from(CONTRATOS_ASSINADOS_BUCKET).remove([prevPath]);
  }
  return path;
}

export async function getContratoAssinadoUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(CONTRATOS_ASSINADOS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeContratoAssinado(contratoId: string, path: string): Promise<void> {
  await supabase.storage.from(CONTRATOS_ASSINADOS_BUCKET).remove([path]);
  const { error } = await supabase
    .from("contratos")
    .update({
      arquivo_assinado_path: null,
      arquivo_assinado_uploaded_at: null,
      arquivo_assinado_mime: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contratoId);
  if (error) throw error;
}