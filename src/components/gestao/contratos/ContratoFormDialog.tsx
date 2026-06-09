import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
  calcularValorMensal,
  createContrato,
  FORMA_PAGAMENTO_LABEL,
  FREQUENCIA_LABEL,
  MODALIDADE_LABEL,
  montarVariaveis,
  STATUS_LABEL,
  TEMPLATE_PADRAO,
  updateContrato,
  type ContratoComJoin,
  type ContratoStatus,
  type DadosResponsavel,
  type FormaPagamento,
  type Frequencia,
  type Modalidade,
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

function dadosFromPaciente(resp: any): DadosResponsavel {
  if (!resp) return {};
  const first = Array.isArray(resp) ? resp[0] : resp;
  if (!first || typeof first !== "object") return {};
  return {
    nome: first.nome ?? "",
    cpf: first.cpf ?? "",
    rg: first.rg ?? "",
    endereco: first.endereco ?? "",
  };
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
  const [qtdSessoes, setQtdSessoes] = useState<string>("");
  const [frequencia, setFrequencia] = useState<Frequencia>("semanal");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataTermino, setDataTermino] = useState<string>("");
  const [status, setStatus] = useState<ContratoStatus>("rascunho");
  const [termos, setTermos] = useState<string>(TEMPLATE_PADRAO);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);

  // Novos campos do modelo Estação
  const [modalidade, setModalidade] = useState<Modalidade>("pacote_mensal");
  const [aulasPorMes, setAulasPorMes] = useState<string>("4");
  const [valorComDesc, setValorComDesc] = useState("R$ 0,00");
  const [valorSemDesc, setValorSemDesc] = useState("R$ 0,00");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [diaVencimento, setDiaVencimento] = useState<string>("10");
  const [cidade, setCidade] = useState("São Paulo");
  const [respNome, setRespNome] = useState("");
  const [respCpf, setRespCpf] = useState("");
  const [respRg, setRespRg] = useState("");
  const [respEndereco, setRespEndereco] = useState("");
  const [autorizaImagem, setAutorizaImagem] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    if (contrato) {
      setPaciente(contrato.paciente as any);
      setProfId(contrato.profissional_id);
      setServId(contrato.servico_id);
      setQtdSessoes(contrato.qtd_sessoes ? String(contrato.qtd_sessoes) : "");
      setFrequencia(contrato.frequencia);
      setDataInicio(contrato.data_inicio);
      setDataTermino(contrato.data_termino ?? "");
      setStatus(contrato.status);
      setTermos(contrato.termos || TEMPLATE_PADRAO);
      setModalidade((contrato.modalidade as Modalidade) ?? "pacote_mensal");
      setAulasPorMes(contrato.aulas_por_mes ? String(contrato.aulas_por_mes) : "4");
      setValorComDesc(formatBRL(contrato.valor_com_desconto_centavos ?? contrato.valor_centavos ?? 0));
      setValorSemDesc(formatBRL(contrato.valor_sem_desconto_centavos ?? 0));
      setFormaPagamento((contrato.forma_pagamento as FormaPagamento) ?? "pix");
      setDiaVencimento(contrato.dia_vencimento ? String(contrato.dia_vencimento) : "10");
      setCidade(contrato.cidade_assinatura ?? "São Paulo");
      const d = contrato.dados_responsavel ?? {};
      setRespNome(d.nome ?? "");
      setRespCpf(d.cpf ?? "");
      setRespRg(d.rg ?? "");
      setRespEndereco(d.endereco ?? "");
      setAutorizaImagem(contrato.autoriza_imagem === true);
    } else {
      setPaciente(null);
      setProfId(profissionais[0]?.id ?? "");
      setServId(servicos[0]?.id ?? "");
      setQtdSessoes("");
      setFrequencia("semanal");
      setDataInicio(new Date().toISOString().slice(0, 10));
      setDataTermino("");
      setStatus("rascunho");
      setTermos(TEMPLATE_PADRAO);
      setModalidade("pacote_mensal");
      setAulasPorMes("4");
      setValorComDesc("R$ 0,00");
      setValorSemDesc("R$ 0,00");
      setFormaPagamento("pix");
      setDiaVencimento("10");
      setCidade("São Paulo");
      setRespNome("");
      setRespCpf("");
      setRespRg("");
      setRespEndereco("");
      setAutorizaImagem(false);
    }
    setPacienteSearch("");
    setPacienteResults([]);
    setPacienteOpen(false);
    setStep(0);
    setMaxVisited(contrato ? 4 : 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualiza valores com base no serviço quando criando novo
  useEffect(() => {
    if (isEdit || !open) return;
    const s = servicos.find((x) => x.id === servId);
    if (s) {
      const desconto = Math.max(0, s.valor_centavos - 1500);
      setValorComDesc(formatBRL(desconto));
      setValorSemDesc(formatBRL(s.valor_centavos));
    }
  }, [servId, servicos, isEdit, open]);

  // Pré-preenche dados do responsável a partir do paciente
  useEffect(() => {
    if (!paciente || respNome.trim()) return;
    const d = dadosFromPaciente((paciente as any).responsaveis);
    if (d.nome) setRespNome(d.nome);
    if (d.cpf) setRespCpf(d.cpf);
    if (d.rg) setRespRg(d.rg);
    if (d.endereco) setRespEndereco(d.endereco);
  }, [paciente]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const valorMensalPreview = calcularValorMensal(
    parseInt(aulasPorMes, 10) || 0,
    parseBRLToCents(valorComDesc),
    formaPagamento,
  );

  function buildVars() {
    const s = servicos.find((x) => x.id === servId);
    return montarVariaveis({
      paciente_nome: paciente?.nome ?? "",
      responsavel: { nome: respNome, cpf: respCpf, rg: respRg, endereco: respEndereco },
      servico_nome: s?.nome ?? "",
      modalidade,
      aulas_por_mes: parseInt(aulasPorMes, 10) || null,
      valor_com_desconto_centavos: parseBRLToCents(valorComDesc),
      valor_sem_desconto_centavos: parseBRLToCents(valorSemDesc),
      forma_pagamento: formaPagamento,
      dia_vencimento: parseInt(diaVencimento, 10) || null,
      cidade_assinatura: cidade,
      autoriza_imagem: autorizaImagem,
      data_inicio: dataInicio,
      data_termino: dataTermino || null,
      frequencia,
      qtd_sessoes: parseInt(qtdSessoes, 10) || null,
    });
  }

  function regenerarTemplate() {
    setTermos(aplicarTemplate(TEMPLATE_PADRAO, buildVars()));
  }

  async function handleSubmit() {
    if (!paciente) return toast.error("Selecione um paciente");
    if (!profId) return toast.error("Selecione um profissional");
    if (!servId) return toast.error("Selecione um serviço");
    if (!dataInicio) return toast.error("Informe a data de início");
    if (!respNome.trim()) return toast.error("Informe o nome do responsável");
    if (!respCpf.trim()) return toast.error("Informe o CPF do responsável");

    const valorComDescCents = parseBRLToCents(valorComDesc);
    const valorSemDescCents = parseBRLToCents(valorSemDesc);
    const qtd = parseInt(qtdSessoes, 10);
    const aulas = parseInt(aulasPorMes, 10) || null;
    const valorMensal = calcularValorMensal(aulas, valorComDescCents, formaPagamento);

    // Auto-aplica template se ainda houver placeholders ou se o texto não foi editado
    let termosFinal = termos;
    if (termos === TEMPLATE_PADRAO || /\{\{\w+\}\}/.test(termos)) {
      termosFinal = aplicarTemplate(termos, buildVars());
    }

    const payload = {
      paciente_id: paciente.id,
      profissional_id: profId,
      servico_id: servId,
      valor_centavos: modalidade === "pacote_mensal" ? valorMensal : valorSemDescCents,
      qtd_sessoes: isNaN(qtd) ? null : qtd,
      frequencia,
      data_inicio: dataInicio,
      data_termino: dataTermino || null,
      status,
      termos: termosFinal,
      template_origem: "padrao",
      modalidade,
      aulas_por_mes: aulas,
      valor_com_desconto_centavos: valorComDescCents,
      valor_sem_desconto_centavos: valorSemDescCents,
      forma_pagamento: formaPagamento,
      dia_vencimento: parseInt(diaVencimento, 10) || null,
      cidade_assinatura: cidade.trim() || "São Paulo",
      dados_responsavel: {
        nome: respNome.trim(),
        cpf: respCpf.trim(),
        rg: respRg.trim(),
        endereco: respEndereco.trim(),
      },
      autoriza_imagem: autorizaImagem,
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

          {/* Dados do responsável */}
          <fieldset className="rounded-md border border-amber-100 bg-amber-50/30 p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
              Dados do responsável
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome completo *</Label>
                <Input value={respNome} onChange={(e) => setRespNome(e.target.value)} />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input value={respCpf} onChange={(e) => setRespCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div>
                <Label>RG</Label>
                <Input value={respRg} onChange={(e) => setRespRg(e.target.value)} />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={respEndereco} onChange={(e) => setRespEndereco(e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Modalidade e pagamento */}
          <fieldset className="rounded-md border border-amber-100 bg-amber-50/30 p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
              Modalidade e pagamento
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Modalidade *</Label>
                <Select value={modalidade} onValueChange={(v) => setModalidade(v as Modalidade)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MODALIDADE_LABEL) as Modalidade[]).map((m) => (
                      <SelectItem key={m} value={m}>{MODALIDADE_LABEL[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aulas por mês</Label>
                <Input type="number" min={1} max={12} value={aulasPorMes} onChange={(e) => setAulasPorMes(e.target.value)} />
              </div>
              <div>
                <Label>Dia de vencimento</Label>
                <Input type="number" min={1} max={28} value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} />
              </div>
              <div>
                <Label>Valor c/ desconto (aula)</Label>
                <Input value={valorComDesc} onChange={(e) => setValorComDesc(formatBRL(parseBRLToCents(e.target.value)))} />
              </div>
              <div>
                <Label>Valor s/ desconto (aula)</Label>
                <Input value={valorSemDesc} onChange={(e) => setValorSemDesc(formatBRL(parseBRLToCents(e.target.value)))} />
              </div>
              <div>
                <Label>Forma de pagamento</Label>
                <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(FORMA_PAGAMENTO_LABEL) as FormaPagamento[]).map((f) => (
                      <SelectItem key={f} value={f}>{FORMA_PAGAMENTO_LABEL[f]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 rounded-md bg-white px-3 py-2 text-sm">
              <span className="text-gray-600">Valor mensal do pacote: </span>
              <span className="font-semibold text-amber-800">{formatBRL(valorMensalPreview)}</span>
              {formaPagamento === "cartao_credito" && (
                <span className="ml-2 text-xs text-gray-500">(inclui acréscimo de R$ 10,00 por aula)</span>
              )}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Cidade da assinatura</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex flex-1 items-center justify-between rounded-md border border-amber-100 bg-amber-50/30 px-3 py-2">
                <div>
                  <Label className="text-sm">Autoriza uso de imagem</Label>
                  <p className="text-xs text-gray-500">Em mídias sociais da Estação Aprender</p>
                </div>
                <Switch checked={autorizaImagem} onCheckedChange={setAutorizaImagem} />
              </div>
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