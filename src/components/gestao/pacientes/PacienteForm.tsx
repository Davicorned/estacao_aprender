import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PacienteAvatar } from "./PacienteAvatar";
import { ProntuarioTab } from "@/components/gestao/prontuario/ProntuarioTab";
import { HistoricoSessoesTab } from "@/components/gestao/prontuario/HistoricoSessoesTab";
import { FinanceiroPacienteTab } from "@/components/gestao/financeiro/FinanceiroPacienteTab";
import {
  buscarCep,
  calcularIdade,
  checkCpfDisponivel,
  COMO_CONHECEU,
  createPaciente,
  deletePaciente,
  ESTADOS,
  maskCelular,
  maskCEP,
  maskCPF,
  maskResidencial,
  PARENTESCOS,
  type Paciente,
  type PacienteInput,
  type Sexo,
  updatePaciente,
  uploadFotoPaciente,
} from "@/lib/pacientes";

type FormState = {
  nome: string;
  data_nascimento: string;
  sexo: Sexo | "";
  cpf: string;
  rg: string;
  email: string;
  responsavel_nome: string;
  responsavel_parentesco: string;
  telefone_celular: string;
  telefone_residencial: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  como_conheceu: string;
  observacoes: string;
  foto_url: string;
  ativo: boolean;
};

function blank(): FormState {
  return {
    nome: "",
    data_nascimento: "",
    sexo: "",
    cpf: "",
    rg: "",
    email: "",
    responsavel_nome: "",
    responsavel_parentesco: "",
    telefone_celular: "",
    telefone_residencial: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "SP",
    como_conheceu: "",
    observacoes: "",
    foto_url: "",
    ativo: true,
  };
}

function fromPaciente(p: Paciente): FormState {
  return {
    nome: p.nome,
    data_nascimento: p.data_nascimento ?? "",
    sexo: p.sexo,
    cpf: p.cpf ? maskCPF(p.cpf) : "",
    rg: p.rg ?? "",
    email: p.email ?? "",
    responsavel_nome: p.responsavel_nome ?? "",
    responsavel_parentesco: p.responsavel_parentesco ?? "",
    telefone_celular: p.telefone_celular ? maskCelular(p.telefone_celular) : "",
    telefone_residencial: p.telefone_residencial ? maskResidencial(p.telefone_residencial) : "",
    cep: p.cep ? maskCEP(p.cep) : "",
    endereco: p.endereco ?? "",
    numero: p.numero ?? "",
    complemento: p.complemento ?? "",
    bairro: p.bairro ?? "",
    cidade: p.cidade ?? "",
    estado: p.estado ?? "SP",
    como_conheceu: p.como_conheceu ?? "",
    observacoes: p.observacoes ?? "",
    foto_url: p.foto_url ?? "",
    ativo: p.ativo,
  };
}

function toInput(s: FormState): PacienteInput {
  return {
    nome: s.nome.trim(),
    data_nascimento: s.data_nascimento,
    sexo: s.sexo as Sexo,
    cpf: s.cpf ? s.cpf.replace(/\D/g, "") : null,
    rg: s.rg.trim() || null,
    email: s.email.trim() || null,
    responsavel_nome: s.responsavel_nome.trim() || null,
    responsavel_parentesco: s.responsavel_parentesco || null,
    telefone_celular: s.telefone_celular.replace(/\D/g, ""),
    telefone_residencial: s.telefone_residencial ? s.telefone_residencial.replace(/\D/g, "") : null,
    cep: s.cep ? s.cep.replace(/\D/g, "") : null,
    endereco: s.endereco.trim() || null,
    numero: s.numero.trim() || null,
    complemento: s.complemento.trim() || null,
    bairro: s.bairro.trim() || null,
    cidade: s.cidade.trim() || null,
    estado: s.estado || null,
    como_conheceu: s.como_conheceu || null,
    observacoes: s.observacoes.trim() || null,
    foto_url: s.foto_url || null,
    ativo: s.ativo,
    profissional_responsavel_id: null,
  };
}

export function PacienteForm({ paciente }: { paciente?: Paciente }) {
  const navigate = useNavigate();
  const isEdit = Boolean(paciente);
  const [form, setForm] = useState<FormState>(() => (paciente ? fromPaciente(paciente) : blank()));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("dados");
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const idade = calcularIdade(form.data_nascimento);

  async function handleCepBlur() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    const r = await buscarCep(digits);
    if (!r) return;
    setForm((f) => ({
      ...f,
      endereco: f.endereco || r.logradouro,
      bairro: f.bairro || r.bairro,
      cidade: f.cidade || r.localidade,
      estado: f.estado || r.uf,
      complemento: f.complemento || r.complemento,
    }));
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isEdit || !paciente) {
      toast.error("Salve o paciente antes de adicionar a foto.");
      return;
    }
    try {
      setUploading(true);
      const url = await uploadFotoPaciente(file, paciente.id);
      await updatePaciente(paciente.id, { foto_url: url });
      set("foto_url", url);
      toast.success("Foto atualizada");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao enviar foto");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function validar(): string | null {
    if (!form.nome.trim()) return "Informe o nome";
    if (!form.data_nascimento) return "Informe a data de nascimento";
    if (!form.sexo) return "Informe o sexo";
    if (form.telefone_celular.replace(/\D/g, "").length < 10) return "Informe um celular válido";
    const cpf = form.cpf.replace(/\D/g, "");
    if (cpf && cpf.length !== 11) return "CPF inválido";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const erro = validar();
    if (erro) {
      toast.error(erro);
      return;
    }
    try {
      setSaving(true);
      const cpf = form.cpf.replace(/\D/g, "");
      if (cpf) {
        const ok = await checkCpfDisponivel(cpf, paciente?.id);
        if (!ok) {
          toast.error("CPF já cadastrado em outro paciente");
          setSaving(false);
          return;
        }
      }
      const payload = toInput(form);
      if (paciente) {
        await updatePaciente(paciente.id, payload);
        toast.success("Paciente atualizado");
      } else {
        const novo = await createPaciente(payload);
        toast.success("Paciente cadastrado");
        void navigate({ to: "/gestao/pacientes/$id", params: { id: novo.id } });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar paciente");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!paciente) return;
    try {
      await deletePaciente(paciente.id);
      toast.success("Paciente excluído");
      void navigate({ to: "/gestao/pacientes" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir paciente");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            {isEdit && <TabsTrigger value="prontuario">Prontuário</TabsTrigger>}
            {isEdit && <TabsTrigger value="historico">Histórico de Sessões</TabsTrigger>}
            {isEdit && <TabsTrigger value="financeiro">Financeiro</TabsTrigger>}
          </TabsList>

          <TabsContent value="dados" className="mt-6 space-y-8">
            {/* Foto */}
            <div className="flex items-center gap-4">
              <PacienteAvatar nome={form.nome || "?"} fotoUrl={form.foto_url || null} size={96} />
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading || !isEdit}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Alterar foto
                </Button>
                {!isEdit && (
                  <p className="mt-1 text-xs text-gray-400">
                    Disponível após salvar o paciente.
                  </p>
                )}
              </div>
            </div>

            {/* Dados básicos */}
            <Section title="Dados pessoais">
              <Field label="Nome completo *" className="md:col-span-2">
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} maxLength={150} />
              </Field>
              <Field label={`Data de nascimento *${idade !== null ? ` — ${idade} anos` : ""}`}>
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => set("data_nascimento", e.target.value)}
                />
              </Field>
              <Field label="Sexo *">
                <RadioGroup
                  value={form.sexo}
                  onValueChange={(v) => set("sexo", v as Sexo)}
                  className="flex gap-4 pt-2"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="M" /> Masculino
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="F" /> Feminino
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="O" /> Outro
                  </label>
                </RadioGroup>
              </Field>
              <Field label="CPF">
                <Input
                  value={form.cpf}
                  onChange={(e) => set("cpf", maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </Field>
              <Field label="RG">
                <Input value={form.rg} onChange={(e) => set("rg", e.target.value)} />
              </Field>
              <Field label="E-mail" className="md:col-span-2">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </Section>

            <Section title="Responsável (menores de idade)">
              <Field label="Nome do responsável" className="md:col-span-2">
                <Input
                  value={form.responsavel_nome}
                  onChange={(e) => set("responsavel_nome", e.target.value)}
                />
              </Field>
              <Field label="Parentesco">
                <Select
                  value={form.responsavel_parentesco || undefined}
                  onValueChange={(v) => set("responsavel_parentesco", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARENTESCOS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <Section title="Telefones">
              <Field label="Celular *">
                <Input
                  value={form.telefone_celular}
                  onChange={(e) => set("telefone_celular", maskCelular(e.target.value))}
                  placeholder="(11) 91234-5678"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Residencial">
                <Input
                  value={form.telefone_residencial}
                  onChange={(e) => set("telefone_residencial", maskResidencial(e.target.value))}
                  placeholder="(11) 3456-7890"
                  inputMode="numeric"
                />
              </Field>
            </Section>

            <Section title="Endereço">
              <Field label="CEP">
                <Input
                  value={form.cep}
                  onChange={(e) => set("cep", maskCEP(e.target.value))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Endereço" className="md:col-span-2">
                <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
              </Field>
              <Field label="Número">
                <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} />
              </Field>
              <Field label="Complemento" className="md:col-span-2">
                <Input value={form.complemento} onChange={(e) => set("complemento", e.target.value)} />
              </Field>
              <Field label="Bairro">
                <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
              </Field>
              <Field label="Cidade">
                <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
              </Field>
              <Field label="Estado">
                <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <Section title="Outros">
              <Field label="Como conheceu?">
                <Select
                  value={form.como_conheceu || undefined}
                  onValueChange={(v) => set("como_conheceu", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMO_CONHECEU.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Observações (visível somente para a equipe)" className="md:col-span-3">
                <Textarea
                  rows={4}
                  value={form.observacoes}
                  onChange={(e) => set("observacoes", e.target.value)}
                />
              </Field>
              <Field label="Paciente ativo">
                <div className="pt-2">
                  <Switch checked={form.ativo} onCheckedChange={(v) => set("ativo", v)} />
                </div>
              </Field>
            </Section>
          </TabsContent>

          {isEdit && (
            <TabsContent value="prontuario" className="mt-6">
              {paciente && <ProntuarioTab paciente={paciente} />}
            </TabsContent>
          )}
          {isEdit && (
            <TabsContent value="historico" className="mt-6">
              {paciente && <HistoricoSessoesTab paciente={paciente} />}
            </TabsContent>
          )}
          {isEdit && (
            <TabsContent value="financeiro" className="mt-6">
              {paciente && <FinanceiroPacienteTab paciente={paciente} />}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir paciente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente. Todos os dados do paciente serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/gestao/pacientes" })}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label className="text-sm text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

function PlaceholderTab({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}