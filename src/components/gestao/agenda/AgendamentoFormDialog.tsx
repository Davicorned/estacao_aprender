import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, FileText, Loader2, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMin,
  checarConflito,
  checarConflitosLote,
  createAgendamento,
  createAgendamentosLote,
  DIAS_SEMANA_LABEL,
  ocorrenciasParaRecorrencia,
  parseIsoDate,
  RECORRENCIA_LABEL,
  type AgendamentoComJoin,
  type AgendamentoInput,
  type AgendamentoTipo,
  type RecorrenciaConfig,
  type RecorrenciaTipo,
  searchPacientesQuick,
  toIsoDate,
  updateAgendamento,
} from "@/lib/agendamentos";
import type { Profissional, Servico } from "@/lib/configuracoes";
import {
  FREQUENCIA_LABEL,
  listarContratosAtivosPorPaciente,
  MODALIDADE_LABEL,
  type ContratoAtivoResumo,
} from "@/lib/contratos";

type PacienteLite = { id: string; nome: string; foto_url: string | null };

function proximaDataParaDiaSemana(dataRef: string, diaSemana: number): string {
  const base = parseIsoDate(dataRef);
  const diff = (diaSemana - base.getDay() + 7) % 7;
  const d = new Date(base);
  d.setDate(base.getDate() + diff);
  return toIsoDate(d);
}

export type FormDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profissionais: Profissional[];
  servicos: Servico[];
  profissionalIdInicial?: string;
  dataInicial?: string;
  horaInicial?: string;
  pacienteInicial?: PacienteLite;
  agendamento?: AgendamentoComJoin; // editar
  onSaved?: () => void;
};

export function AgendamentoFormDialog({
  open,
  onOpenChange,
  profissionais,
  servicos,
  profissionalIdInicial,
  dataInicial,
  horaInicial,
  pacienteInicial,
  agendamento,
  onSaved,
}: FormDialogProps) {
  const isEdit = Boolean(agendamento);
  const [paciente, setPaciente] = useState<PacienteLite | null>(null);
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [pacienteResults, setPacienteResults] = useState<PacienteLite[]>([]);
  const [pacienteOpen, setPacienteOpen] = useState(true);

  const [profissionalId, setProfissionalId] = useState("");
  const [servicoId, setServicoId] = useState<string>("");
  const [tipo, setTipo] = useState<AgendamentoTipo>("presencial");
  const [data, setData] = useState<string>(toIsoDate(new Date()));
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("08:50");
  const [observacoes, setObservacoes] = useState("");

  // Recorrência
  const [modoAgendamento, setModoAgendamento] = useState<"unico" | "recorrente">("unico");
  const [freqManual, setFreqManual] = useState(false);
  const [recTipo, setRecTipo] = useState<RecorrenciaTipo>("nao");
  const [recOcorrencias, setRecOcorrencias] = useState<number>(4);
  const [recSegundoDia, setRecSegundoDia] = useState<number>(4); // padrão Qui
  // Contratos ativos do paciente
  const [contratos, setContratos] = useState<ContratoAtivoResumo[]>([]);
  const [contratoVinculadoId, setContratoVinculadoId] = useState<string | null>(null);

  // Pré-visualização
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDatas, setPreviewDatas] = useState<string[]>([]);
  const [previewConflitos, setPreviewConflitos] = useState<Set<string>>(new Set());
  const [previewSelecionadas, setPreviewSelecionadas] = useState<Set<string>>(new Set());
  const [previewLoading, setPreviewLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  // Reset ao abrir
  useEffect(() => {
    if (!open) return;
    if (agendamento) {
      setPaciente(agendamento.paciente);
      setProfissionalId(agendamento.profissional_id);
      setServicoId(agendamento.servico_id ?? "");
      setTipo(agendamento.tipo);
      setData(agendamento.data);
      setHoraInicio(agendamento.hora_inicio.slice(0, 5));
      setHoraFim(agendamento.hora_fim.slice(0, 5));
      setObservacoes(agendamento.observacoes ?? "");
      setRecTipo("nao");
      setModoAgendamento("unico");
      setFreqManual(false);
      setContratoVinculadoId(agendamento.contrato_id ?? null);
    } else {
      setPaciente(pacienteInicial ?? null);
      setProfissionalId(profissionalIdInicial ?? profissionais[0]?.id ?? "");
      setServicoId(servicos[0]?.id ?? "");
      setTipo("presencial");
      setData(dataInicial ?? toIsoDate(new Date()));
      const hi = horaInicial ?? "08:00";
      setHoraInicio(hi);
      const dur = servicos[0]?.duracao_min ?? 50;
      setHoraFim(addMin(hi, dur));
      setObservacoes("");
      setRecTipo("nao");
      setRecOcorrencias(4);
      setModoAgendamento("unico");
      setFreqManual(false);
      setContratoVinculadoId(null);
    }
    setPacienteSearch("");
    setPacienteResults([]);
    setPacienteOpen(!agendamento && !pacienteInicial);
    setContratos([]);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualiza horaFim quando troca serviço ou horaInicio
  useEffect(() => {
    const dur = servicos.find((s) => s.id === servicoId)?.duracao_min;
    if (dur) setHoraFim(addMin(horaInicio, dur));
  }, [servicoId, horaInicio, servicos]);

  // Busca paciente debounced
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

  // Carrega contratos ativos quando paciente é selecionado
  useEffect(() => {
    if (!paciente || isEdit) return;
    let alive = true;
    listarContratosAtivosPorPaciente(paciente.id)
      .then((rows) => {
        if (alive) setContratos(rows);
      })
      .catch(() => {
        if (alive) setContratos([]);
      });
    return () => {
      alive = false;
    };
  }, [paciente, isEdit]);

  // Config da recorrência (objeto)
  const recTipoDerivado: RecorrenciaTipo =
    recOcorrencias > 0 && recOcorrencias % 8 === 0 ? "duas_por_semana" : "semanal";
  const recTipoEfetivo: RecorrenciaTipo =
    modoAgendamento === "unico" ? "nao" : freqManual ? recTipo : recTipoDerivado;

  const recConfig: RecorrenciaConfig = useMemo(() => {
    if (recTipoEfetivo === "nao") return { tipo: "nao" };
    if (recTipoEfetivo === "duas_por_semana")
      return {
        tipo: "duas_por_semana",
        ocorrencias: recOcorrencias,
        segundoDiaSemana: recSegundoDia,
      };
    return { tipo: recTipoEfetivo, ocorrencias: recOcorrencias };
  }, [recTipoEfetivo, recOcorrencias, recSegundoDia]);

  // Datas previstas (para mostrar "até" calculado)
  const datasPrevistas = useMemo(
    () => (data ? ocorrenciasParaRecorrencia(data, recConfig) : []),
    [data, recConfig],
  );
  const dataFimCalculada = datasPrevistas[datasPrevistas.length - 1] ?? "";

  function aplicarContrato(c: ContratoAtivoResumo) {
    setProfissionalId(c.profissional_id);
    setServicoId(c.servico_id);
    setContratoVinculadoId(c.id);
    setModoAgendamento("recorrente");
    setFreqManual(true);
    // Mapeia frequência do contrato → recorrência
    if (c.frequencia === "semanal") setRecTipo("semanal");
    else if (c.frequencia === "quinzenal") setRecTipo("quinzenal");
    else if (c.frequencia === "mensal") setRecTipo("mensal");
    else setRecTipo("semanal");
    // 2x/semana se aulas_por_mes >= 8 e frequência semanal
    if (c.frequencia === "semanal" && (c.aulas_por_mes ?? 0) >= 8) {
      setRecTipo("duas_por_semana");
    }
    // Sessões sugeridas: restantes do contrato (cap 12)
    const sug = c.sessoes_restantes ?? c.aulas_por_mes ?? 4;
    setRecOcorrencias(Math.max(1, Math.min(12, sug)));
  }

  function validar(): string | null {
    if (!paciente) return "Selecione um paciente";
    if (!profissionalId) return "Selecione um profissional";
    if (!servicoId) return "Selecione um serviço";
    if (!data) return "Informe a data";
    if (!horaInicio || !horaFim) return "Informe os horários";
    if (horaFim <= horaInicio) return "Horário final deve ser após o inicial";
    if (!isEdit) {
      const dt = new Date(`${data}T${horaInicio}`);
      if (dt.getTime() < Date.now() - 60_000) return "Não é possível agendar no passado";
    }
    return null;
  }

  function baseInput(): AgendamentoInput {
    return {
      paciente_id: paciente!.id,
      profissional_id: profissionalId,
      servico_id: servicoId || null,
      data,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      tipo,
      observacoes: observacoes.trim() || null,
    };
  }

  async function abrirPreview() {
    setPreviewLoading(true);
    try {
      const datas = ocorrenciasParaRecorrencia(data, recConfig);
      const conflitos = await checarConflitosLote({
        profissionalId,
        datas,
        horaInicio,
        horaFim,
      });
      setPreviewDatas(datas);
      setPreviewConflitos(conflitos);
      setPreviewSelecionadas(new Set(datas.filter((d) => !conflitos.has(d))));
      setPreviewOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao calcular ocorrências");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSubmit() {
    const erro = validar();
    if (erro) {
      toast.error(erro);
      return;
    }
    if (!isEdit && modoAgendamento === "recorrente") {
      await abrirPreview();
      return;
    }
    setSaving(true);
    try {
      const input = baseInput();
      if (isEdit && agendamento) {
        const conf = await checarConflito({
          profissionalId,
          data,
          horaInicio,
          horaFim,
          excludeId: agendamento.id,
        });
        if (conf) {
          toast.error("Já existe um agendamento neste horário");
          setSaving(false);
          return;
        }
        await updateAgendamento(agendamento.id, input);
        toast.success("Agendamento atualizado");
      } else {
        const conf = await checarConflito({
          profissionalId,
          data,
          horaInicio,
          horaFim,
        });
        if (conf) {
          toast.error("Já existe um agendamento neste horário");
          setSaving(false);
          return;
        }
        await createAgendamento({ ...input, contrato_id: contratoVinculadoId });
        toast.success("Agendamento criado");
      }

      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  }

  async function confirmarPreview() {
    const datas = Array.from(previewSelecionadas).sort();
    if (datas.length === 0) {
      toast.error("Selecione ao menos uma sessão");
      return;
    }
    setSaving(true);
    try {
      const r = await createAgendamentosLote(baseInput(), datas, {
        contratoId: contratoVinculadoId,
        agrupar: true,
      });
      toast.success(`${r.criados} agendamento(s) criado(s)`);
      setPreviewOpen(false);
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar agendamentos");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>Preencha os dados do agendamento.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paciente */}
          <div className="space-y-1">
            <Label>Paciente *</Label>
            {paciente && !pacienteOpen ? (
              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium">{paciente.nome}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPacienteOpen(true);
                    setPacienteSearch("");
                    setContratoVinculadoId(null);
                  }}
                >
                  Trocar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    autoFocus
                    value={pacienteSearch}
                    onChange={(e) => setPacienteSearch(e.target.value)}
                    placeholder="Buscar paciente..."
                    className="pl-9"
                  />
                </div>
                {pacienteResults.length > 0 && (
                  <div className="max-h-44 overflow-y-auto rounded-md border border-gray-200 bg-white">
                    {pacienteResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPaciente(p);
                          setPacienteOpen(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {p.nome}
                      </button>
                    ))}
                  </div>
                )}
                <a
                  href="/gestao/pacientes/novo"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-[#B85A24] hover:underline"
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Cadastrar novo paciente
                </a>
              </div>
            )}
          </div>

          {/* Contratos ativos */}
          {!isEdit && paciente && contratos.length > 0 && (
            <div className="space-y-2">
              {contratos.map((c) => {
                const vinculado = contratoVinculadoId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`rounded-md border p-3 text-sm ${
                      vinculado
                        ? "border-[#D67F43] bg-[#FEF3E8]"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-gray-800">
                          <FileText className="h-4 w-4 text-[#B85A24]" />
                          Contrato vigente
                          {vinculado && (
                            <span className="rounded-full bg-[#D67F43] px-2 py-0.5 text-[10px] font-semibold text-white">
                              VINCULADO
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {c.modalidade ? MODALIDADE_LABEL[c.modalidade] : "—"} ·{" "}
                          {c.aulas_por_mes ?? "?"} aulas/mês ·{" "}
                          {FREQUENCIA_LABEL[c.frequencia]}
                          {c.qtd_sessoes != null && (
                            <>
                              {" · "}
                              {c.sessoes_agendadas}/{c.qtd_sessoes} sessões agendadas
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={vinculado ? "outline" : "default"}
                        onClick={() => (vinculado ? setContratoVinculadoId(null) : aplicarContrato(c))}
                        className={
                          vinculado
                            ? ""
                            : "bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
                        }
                      >
                        {vinculado ? "Desvincular" : "Usar dados"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Profissional *</Label>
              <Select value={profissionalId} onValueChange={setProfissionalId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Serviço *</Label>
              <Select value={servicoId} onValueChange={setServicoId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nome} ({s.duracao_min}min)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Tipo</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as AgendamentoTipo)}
              className="flex gap-4 pt-1"
            >
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="presencial" /> Presencial
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="online" /> Online
              </label>
            </RadioGroup>
          </div>

          {!isEdit && (
            <div className="rounded-md border border-gray-200 p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <CalendarCheck className="h-4 w-4 text-[#B85A24]" />
                Tipo de agendamento
              </div>
              <RadioGroup
                value={modoAgendamento}
                onValueChange={(v) => {
                  setModoAgendamento(v as "unico" | "recorrente");
                  if (v === "unico") setFreqManual(false);
                }}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="unico" /> Sessão única
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="recorrente" /> Pacote recorrente
                </label>
              </RadioGroup>

              {modoAgendamento === "recorrente" && (
                <div className="space-y-2 pt-1">
                  <Label>Quantidade de sessões</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[4, 8, 12, 16].map((n) => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={recOcorrencias === n ? "default" : "outline"}
                        onClick={() => setRecOcorrencias(n)}
                        className={
                          recOcorrencias === n
                            ? "bg-[#B85A24] text-white hover:bg-[#A04E1F]"
                            : ""
                        }
                      >
                        {n}
                      </Button>
                    ))}
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={recOcorrencias}
                      onChange={(e) =>
                        setRecOcorrencias(
                          Math.max(1, Math.min(52, Number(e.target.value) || 1)),
                        )
                      }
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    Frequência:{" "}
                    <strong>{RECORRENCIA_LABEL[recTipoEfetivo]}</strong>
                    {!freqManual && (
                      <button
                        type="button"
                        onClick={() => {
                          setFreqManual(true);
                          setRecTipo(recTipoDerivado);
                        }}
                        className="ml-2 text-[#B85A24] hover:underline"
                      >
                        alterar
                      </button>
                    )}
                  </p>
                  {freqManual && (
                    <Select
                      value={recTipo}
                      onValueChange={(v) => setRecTipo(v as RecorrenciaTipo)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">{RECORRENCIA_LABEL.semanal}</SelectItem>
                        <SelectItem value="duas_por_semana">
                          {RECORRENCIA_LABEL.duas_por_semana}
                        </SelectItem>
                        <SelectItem value="quinzenal">{RECORRENCIA_LABEL.quinzenal}</SelectItem>
                        <SelectItem value="mensal">{RECORRENCIA_LABEL.mensal}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Data / dias da semana / horários */}
          {(modoAgendamento === "unico" || isEdit) && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Data *</Label>
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Início *</Label>
                <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} step={900} />
              </div>
              <div className="space-y-1">
                <Label>Fim *</Label>
                <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} step={900} />
              </div>
            </div>
          )}

          {!isEdit && modoAgendamento === "recorrente" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {recTipoEfetivo === "duas_por_semana" ? (
                  <>
                    <div className="space-y-1">
                      <Label>1º dia da semana *</Label>
                      <Select
                        value={String(parseIsoDate(data).getDay())}
                        onValueChange={(v) =>
                          setData(proximaDataParaDiaSemana(data, Number(v)))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA_LABEL.map((nome, i) => (
                            <SelectItem key={i} value={String(i)}>{nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>2º dia da semana *</Label>
                      <Select
                        value={String(recSegundoDia)}
                        onValueChange={(v) => setRecSegundoDia(Number(v))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA_LABEL.map((nome, i) => (
                            <SelectItem key={i} value={String(i)}>{nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 col-span-2">
                    <Label>Dia da semana *</Label>
                    <Select
                      value={String(parseIsoDate(data).getDay())}
                      onValueChange={(v) =>
                        setData(proximaDataParaDiaSemana(data, Number(v)))
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIAS_SEMANA_LABEL.map((nome, i) => (
                          <SelectItem key={i} value={String(i)}>{nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Data de início *</Label>
                  <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Início *</Label>
                  <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} step={900} />
                </div>
                <div className="space-y-1">
                  <Label>Fim *</Label>
                  <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} step={900} />
                </div>
              </div>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <strong>{datasPrevistas.length}</strong> sessões — de{" "}
                {parseIsoDate(data).toLocaleDateString("pt-BR")} a{" "}
                {dataFimCalculada
                  ? parseIsoDate(dataFimCalculada).toLocaleDateString("pt-BR")
                  : "—"}
                {recTipoEfetivo === "duas_por_semana" && (
                  <>
                    {" · "}
                    {DIAS_SEMANA_LABEL[parseIsoDate(data).getDay()]} e{" "}
                    {DIAS_SEMANA_LABEL[recSegundoDia]}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || previewLoading}
            className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            {(saving || previewLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isEdit && modoAgendamento === "recorrente" ? "Pré-visualizar sessões" : "Salvar"}
          </Button>
        </DialogFooter>

        {/* Pré-visualização das ocorrências */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar sessões a criar</DialogTitle>
              <DialogDescription>
                Desmarque as sessões que não deseja criar. Conflitos vêm desmarcados por padrão.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-72 overflow-y-auto rounded-md border border-gray-200 divide-y">
              {previewDatas.map((d) => {
                const conf = previewConflitos.has(d);
                const sel = previewSelecionadas.has(d);
                const dt = parseIsoDate(d);
                return (
                  <label
                    key={d}
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${
                      conf ? "bg-red-50" : "bg-white"
                    }`}
                  >
                    <Checkbox
                      checked={sel}
                      onCheckedChange={(v) => {
                        const novo = new Set(previewSelecionadas);
                        if (v) novo.add(d);
                        else novo.delete(d);
                        setPreviewSelecionadas(novo);
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {DIAS_SEMANA_LABEL[dt.getDay()]},{" "}
                        {dt.toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {horaInicio} – {horaFim}
                      </div>
                    </div>
                    {conf && (
                      <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                        CONFLITO
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="text-xs text-gray-500">
              {previewSelecionadas.size} de {previewDatas.length} sessões serão criadas
              {previewConflitos.size > 0 && ` · ${previewConflitos.size} em conflito`}
              {contratoVinculadoId && " · vinculadas ao contrato"}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Voltar
              </Button>
              <Button
                onClick={confirmarPreview}
                disabled={saving || previewSelecionadas.size === 0}
                className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar {previewSelecionadas.size} sessão(ões)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}