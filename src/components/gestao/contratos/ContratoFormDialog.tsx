import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchPacientesQuick } from "@/lib/agendamentos";
import {
  formatBRL,
  parseBRLToCents,
  type Profissional,
  type Servico,
} from "@/lib/configuracoes";
import {
  aplicarTemplate,
  calcularDataTermino,
  createContrato,
  FREQUENCIA_LABEL,
  STATUS_LABEL,
  TEMPLATE_PADRAO,
  updateContrato,
  type ContratoComJoin,
  type ContratoStatus,
  type Frequencia,
} from "@/lib/contratos";

type PacienteLite = { id: string; nome: string; foto_url: string | null; telefone_celular?: string | null; responsaveis?: any };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profissionais: Profissional[];
  servicos: Servico[];
  contrato?: ContratoComJoin;
  onSaved?: () => void;
};

function nomeResponsavel(resp: any): string {
  if (!resp) return "";
  if (Array.isArray(resp) && resp[0]?.nome) return resp[0].nome;
  if (typeof resp === "object" && resp.nome) return resp.nome;
  return "";
}

function formatData(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function ContratoFormDialog({
  open,
  onOpenChange,
  profissionais,
  servicos,
  contrato,
  onSaved,
}: Props) {
  const isEdit = Boolean(contrato);
  const [paciente, setPaciente] = useState<PacienteLite | null>(null);
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [pacienteResults, setPacienteResults] = useState<PacienteLite[]>([]);
  const [pacienteOpen, setPacienteOpen] = useState(false);

  const [profId, setProfId] = useState("");
  const [servId, setServId] = useState("");
  const [valorInput, setValorInput] = useState("R$ 0,00");
  const [qtdSessoes, setQtdSessoes] = useState<string>("");
  const [frequencia, setFrequencia] = useState<Frequencia>("semanal");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataTermino, setDataTermino] = useState<string>("");
  const [status, setStatus] = useState<ContratoStatus>("rascunho");
  const [termos, setTermos] = useState<string>(TEMPLATE_PADRAO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (contrato) {
      setPaciente(contrato.paciente as any);
      setProfId(contrato.profissional_id);
      setServId(contrato.servico_id);
      setValorInput(formatBRL(contrato.valor_centavos));
      setQtdSessoes(contrato.qtd_sessoes ? String(contrato.qtd_sessoes) : "");
      setFrequencia(contrato.frequencia);
      setDataInicio(contrato.data_inicio);
      setDataTermino(contrato.data_termino ?? "");
      setStatus(contrato.status);
      setTermos(contrato.termos || TEMPLATE_PADRAO);
    } else {
      setPaciente(null);
      setProfId(profissionais[0]?.id ?? "");
      setServId(servicos[0]?.id ?? "");
      setValorInput("R$ 0,00");
      setQtdSessoes("");
      setFrequencia("semanal");
      setDataInicio(new Date().toISOString().slice(0, 10));
      setDataTermino("");
      setStatus("rascunho");
      setTermos(TEMPLATE_PADRAO);
    }
    setPacienteSearch("");
    setPacienteResults([]);
    setPacienteOpen(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualiza valor com base no serviço quando criando novo
  useEffect(() => {
    if (isEdit || !open) return;
    const s = servicos.find((x) => x.id === servId);
    if (s) setValorInput(formatBRL(s.valor_centavos));
  }, [servId, servicos, isEdit, open]);

  // Calcula data término
  useEffect(() => {
    const qtd = parseInt(qtdSessoes, 10);
    const novo = calcularDataTermino(dataInicio, isNaN(qtd) ? null : qtd, frequencia);
    if (novo) setDataTermino(novo);
  }, [qtdSessoes, frequencia, dataInicio]);

  // Busca paciente
  useEffect(() => {
    if (!pacienteOpen) return;
    const t = setTimeout(async () => {
      if (pacienteSearch.trim().length < 2) {
        setPacienteResults([]);
        return;
      }
      try {
        const r = await searchPacientesQuick(pacienteSearch);
        setPacienteResults(r as PacienteLite[]);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [pacienteSearch, pacienteOpen]);

  // Recalcula template ao mudar variáveis (apenas quando texto ainda é o template padrão ou variáveis presentes)
  function regenerarTemplate() {
    const s = servicos.find((x) => x.id === servId);
    const vars = {
      NOME_PACIENTE: paciente?.nome ?? "",
      NOME_RESPONSAVEL: nomeResponsavel((paciente as any)?.responsaveis),
      TIPO_SERVICO: s?.nome ?? "",
      VALOR: formatBRL(parseBRLToCents(valorInput)),
      FREQUENCIA: FREQUENCIA_LABEL[frequencia],
      QTD_SESSOES: qtdSessoes || "Indeterminado",
      DATA_INICIO: formatData(dataInicio),
      DATA_TERMINO: dataTermino ? formatData(dataTermino) : "—",
    };
    setTermos(aplicarTemplate(TEMPLATE_PADRAO, vars));
  }

  async function handleSubmit() {
    if (!paciente) return toast.error("Selecione um paciente");
    if (!profId) return toast.error("Selecione um profissional");
    if (!servId) return toast.error("Selecione um serviço");
    if (!dataInicio) return toast.error("Informe a data de início");

    const cents = parseBRLToCents(valorInput);
    const qtd = parseInt(qtdSessoes, 10);

    // Auto-aplica template se ainda houver placeholders ou se o texto não foi editado
    let termosFinal = termos;
    if (termos === TEMPLATE_PADRAO || /\{\{\w+\}\}/.test(termos)) {
      const s = servicos.find((x) => x.id === servId);
      termosFinal = aplicarTemplate(termos, {
        NOME_PACIENTE: paciente.nome ?? "",
        NOME_RESPONSAVEL: nomeResponsavel((paciente as any)?.responsaveis),
        TIPO_SERVICO: s?.nome ?? "",
        VALOR: formatBRL(cents),
        FREQUENCIA: FREQUENCIA_LABEL[frequencia],
        QTD_SESSOES: qtdSessoes || "Indeterminado",
        DATA_INICIO: formatData(dataInicio),
        DATA_TERMINO: dataTermino ? formatData(dataTermino) : "—",
      });
    }

    const payload = {
      paciente_id: paciente.id,
      profissional_id: profId,
      servico_id: servId,
      valor_centavos: cents,
      qtd_sessoes: isNaN(qtd) ? null : qtd,
      frequencia,
      data_inicio: dataInicio,
      data_termino: dataTermino || null,
      status,
      termos: termosFinal,
      template_origem: "padrao",
    };

    setSaving(true);
    try {
      if (isEdit && contrato) {
        await updateContrato(contrato.id, payload as any);
        toast.success("Contrato atualizado");
      } else {
        await createContrato(payload as any);
        toast.success("Contrato gerado");
      }
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar contrato");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar contrato" : "Novo contrato"}</DialogTitle>
          <DialogDescription>
            Preencha os dados — os termos serão atualizados a partir do template padrão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paciente */}
          <div>
            <Label>Paciente *</Label>
            {paciente ? (
              <div className="mt-1 flex items-center justify-between rounded-md border bg-amber-50/50 px-3 py-2">
                <span className="font-medium">{paciente.nome}</span>
                <Button variant="ghost" size="sm" onClick={() => setPaciente(null)}>
                  Trocar
                </Button>
              </div>
            ) : (
              <div className="relative mt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar paciente por nome..."
                    value={pacienteSearch}
                    onChange={(e) => setPacienteSearch(e.target.value)}
                    onFocus={() => setPacienteOpen(true)}
                  />
                </div>
                {pacienteOpen && pacienteResults.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
                    {pacienteResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="block w-full px-3 py-2 text-left hover:bg-amber-50"
                        onClick={() => {
                          setPaciente(p);
                          setPacienteOpen(false);
                          setPacienteSearch("");
                        }}
                      >
                        {p.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Profissional *</Label>
              <Select value={profId} onValueChange={setProfId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de serviço *</Label>
              <Select value={servId} onValueChange={setServId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Valor por sessão *</Label>
              <Input
                value={valorInput}
                onChange={(e) => setValorInput(formatBRL(parseBRLToCents(e.target.value)))}
              />
            </div>
            <div>
              <Label>Qtd de sessões</Label>
              <Input
                type="number"
                placeholder="vazio = indeterminado"
                value={qtdSessoes}
                onChange={(e) => setQtdSessoes(e.target.value)}
              />
            </div>
            <div>
              <Label>Frequência</Label>
              <Select value={frequencia} onValueChange={(v) => setFrequencia(v as Frequencia)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["semanal", "quinzenal", "mensal", "livre"] as Frequencia[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {FREQUENCIA_LABEL[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Data de início *</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label>Data de término</Label>
              <Input
                type="date"
                value={dataTermino}
                onChange={(e) => setDataTermino(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ContratoStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["rascunho", "ativo", "encerrado", "cancelado"] as ContratoStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label>Termos do contrato</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={regenerarTemplate}
                className="text-[#D67F43]"
              >
                Reaplicar template
              </Button>
            </div>
            <Textarea
              rows={14}
              value={termos}
              onChange={(e) => setTermos(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gradient-to-r from-[#D67F43] to-[#E89B6D] text-white hover:opacity-90"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Salvar" : "Gerar contrato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}