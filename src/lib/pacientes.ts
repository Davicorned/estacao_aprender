import { supabase } from "@/integrations/supabase/client";
import { registrarEvento } from "@/lib/historico";

export type Sexo = "M" | "F" | "O";

export type Paciente = {
  id: string;
  nome: string;
  data_nascimento: string; // yyyy-mm-dd
  sexo: Sexo;
  cpf: string | null;
  rg: string | null;
  email: string | null;
  responsavel_nome: string | null;
  responsavel_parentesco: string | null;
  telefone_celular: string;
  telefone_residencial: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  como_conheceu: string | null;
  observacoes: string | null;
  foto_url: string | null;
  ativo: boolean;
  profissional_responsavel_id: string | null;
  responsavel2_nome: string | null;
  responsavel2_parentesco: string | null;
  responsavel2_celular: string | null;
  escolaridade_nivel: string | null;
  escola_nome: string | null;
  escola_turma: string | null;
  escola_professor: string | null;
  escola_coordenacao: string | null;
  created_at: string;
  updated_at: string;
};

export type PacienteInput = Omit<Paciente, "id" | "created_at" | "updated_at">;

export const PACIENTES_BUCKET = "fotos-pacientes";
export const PAGE_SIZE = 20;

export type ListParams = {
  search?: string;
  status?: "todos" | "ativos" | "inativos";
  profissionalId?: string | null;
  page?: number;
  sortBy?: "nome" | "created_at";
};

export async function listPacientes(params: ListParams = {}) {
  const {
    search = "",
    status = "ativos",
    profissionalId = null,
    page = 1,
    sortBy = "nome",
  } = params;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("pacientes")
    .select("*", { count: "exact" });

  if (status === "ativos") query = query.eq("ativo", true);
  if (status === "inativos") query = query.eq("ativo", false);
  if (profissionalId) query = query.eq("profissional_responsavel_id", profissionalId);

  if (search.trim()) {
    const s = search.trim();
    const digits = s.replace(/\D/g, "");
    const parts = [`nome.ilike.%${s}%`];
    if (digits.length >= 3) {
      parts.push(`telefone_celular.ilike.%${digits}%`);
      parts.push(`cpf.ilike.%${digits}%`);
    }
    query = query.or(parts.join(","));
  }

  query = query
    .order(sortBy === "nome" ? "nome" : "created_at", { ascending: sortBy === "nome" })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Paciente[], count: count ?? 0 };
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Paciente) ?? null;
}

export async function createPaciente(input: PacienteInput): Promise<Paciente> {
  const { data, error } = await supabase
    .from("pacientes")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  void registrarEvento((data as Paciente).id, "paciente_criado", `Paciente ${(data as Paciente).nome} cadastrado`);
  return data as Paciente;
}

export async function updatePaciente(
  id: string,
  input: Partial<PacienteInput>,
): Promise<Paciente> {
  const { data, error } = await supabase
    .from("pacientes")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  const campos = Object.keys(input).filter((k) => k !== "updated_at");
  if (campos.length > 0) {
    void registrarEvento(id, "paciente_editado", `Dados atualizados (${campos.length} ${campos.length === 1 ? "campo" : "campos"})`, { campos });
  }
  return data as Paciente;
}

export async function deletePaciente(id: string): Promise<void> {
  const { error } = await supabase.from("pacientes").delete().eq("id", id);
  if (error) throw error;
}

// ============ Stats de agendamentos ============

export type PacienteAgendamentoStats = {
  ultima_sessao: string | null; // ISO date yyyy-mm-dd
  proximo_agendamento: string | null; // ISO date yyyy-mm-dd
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function nowHora(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
}

/** Busca em batch a última sessão atendida e o próximo agendamento (≠ cancelado) por paciente. */
export async function getPacientesAgendamentoStats(
  ids: string[],
): Promise<Record<string, PacienteAgendamentoStats>> {
  const result: Record<string, PacienteAgendamentoStats> = {};
  if (ids.length === 0) return result;
  for (const id of ids) result[id] = { ultima_sessao: null, proximo_agendamento: null };

  const hoje = todayIso();
  const agora = nowHora();

  // Última sessão: status = atendido e data <= hoje, ordenada desc
  const { data: ultimas, error: e1 } = await supabase
    .from("agendamentos")
    .select("paciente_id, data, hora_inicio")
    .in("paciente_id", ids)
    .eq("status", "atendido")
    .lte("data", hoje)
    .order("data", { ascending: false })
    .order("hora_inicio", { ascending: false });
  if (e1) throw e1;
  for (const row of ultimas ?? []) {
    const r = row as { paciente_id: string; data: string };
    if (!result[r.paciente_id].ultima_sessao) result[r.paciente_id].ultima_sessao = r.data;
  }

  // Próximo agendamento: status != cancelado e (data > hoje, ou data = hoje e hora_inicio >= agora)
  const { data: proximos, error: e2 } = await supabase
    .from("agendamentos")
    .select("paciente_id, data, hora_inicio")
    .in("paciente_id", ids)
    .neq("status", "cancelado")
    .or(`data.gt.${hoje},and(data.eq.${hoje},hora_inicio.gte.${agora})`)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });
  if (e2) throw e2;
  for (const row of proximos ?? []) {
    const r = row as { paciente_id: string; data: string };
    if (!result[r.paciente_id].proximo_agendamento) result[r.paciente_id].proximo_agendamento = r.data;
  }

  return result;
}

/** Formata uma data ISO (yyyy-mm-dd) como rótulo relativo em pt-BR. */
export function formatRelativoData(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  target.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diffDias = Math.round((target.getTime() - hoje.getTime()) / 86_400_000);
  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Amanhã";
  if (diffDias === -1) return "Ontem";
  const abs = Math.abs(diffDias);
  const futuro = diffDias > 0;
  if (abs < 7) return futuro ? `em ${abs} dias` : `há ${abs} dias`;
  if (abs < 30) {
    const sem = Math.round(abs / 7);
    return futuro
      ? `em ${sem} ${sem === 1 ? "semana" : "semanas"}`
      : `há ${sem} ${sem === 1 ? "semana" : "semanas"}`;
  }
  if (abs < 365) {
    const mes = Math.round(abs / 30);
    return futuro
      ? `em ${mes} ${mes === 1 ? "mês" : "meses"}`
      : `há ${mes} ${mes === 1 ? "mês" : "meses"}`;
  }
  const anos = Math.round(abs / 365);
  return futuro
    ? `em ${anos} ${anos === 1 ? "ano" : "anos"}`
    : `há ${anos} ${anos === 1 ? "ano" : "anos"}`;
}

export async function checkCpfDisponivel(cpf: string, excludeId?: string): Promise<boolean> {
  if (!cpf) return true;
  let q = supabase.from("pacientes").select("id").eq("cpf", cpf).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).length === 0;
}

export async function uploadFotoPaciente(file: File, pacienteId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${pacienteId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(PACIENTES_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(PACIENTES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ============ Helpers ============

export function calcularIdade(dataNasc: string): number | null {
  if (!dataNasc) return null;
  const d = new Date(dataNasc);
  if (Number.isNaN(d.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
  return idade;
}

export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Máscaras (input → display)
export function maskCPF(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCelular(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskResidencial(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export function maskCEP(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatTelefoneDisplay(v: string | null | undefined): string {
  if (!v) return "—";
  const d = v.replace(/\D/g, "");
  if (d.length === 11) return maskCelular(d);
  if (d.length === 10) return maskResidencial(d);
  return v;
}

export type ViaCepResult = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export async function buscarCep(cep: string): Promise<ViaCepResult | null> {
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (!res.ok) return null;
    const json = (await res.json()) as ViaCepResult;
    if (json.erro) return null;
    return json;
  } catch {
    return null;
  }
}

export const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export const PARENTESCOS = ["Mãe", "Pai", "Avó/Avô", "Tio/Tia", "Irmão/Irmã", "Responsável legal", "Outro"] as const;

export const COMO_CONHECEU = ["Indicação", "Google", "Instagram", "Escola", "Outro"] as const;

export const ESCOLARIDADE_NIVEIS = [
  "Educação Infantil",
  "Fundamental I",
  "Fundamental II",
  "Ensino Médio",
  "Superior",
  "Outro",
] as const;