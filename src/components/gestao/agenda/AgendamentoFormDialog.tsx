import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
  createAgendamento,
  createAgendamentosRecorrentes,
  ocorrenciasParaRecorrencia,
  type AgendamentoComJoin,
  type AgendamentoInput,
  type AgendamentoTipo,
  type Recorrencia,
  searchPacientesQuick,
  toIsoDate,
  updateAgendamento,
} from "@/lib/agendamentos";
import type { Profissional, Servico } from "@/lib/configuracoes";

type PacienteLite = { id: string; nome: string; foto_url: string | null };

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
  const [recorrencia, setRecorrencia] = useState<Recorrencia>("nao");
  const [confirmRecOpen, setConfirmRecOpen] = useState(false);
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
      setRecorrencia("nao");
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
      setRecorrencia("nao");
    }
    setPacienteSearch("");
    setPacienteResults([]);
    setPacienteOpen(!agendamento && !pacienteInicial);
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

  const ocorrenciasCount = useMemo(
    () => ocorrenciasParaRecorrencia(data, recorrencia).length,
    [data, recorrencia],
  );

  function validar(): string | null {
    if (!paciente) return "Selecione um paciente";
    if (!profissionalId) return "Selecione um profissional";
    if (!servicoId) return "Selecione um procedimento";
    if (!data) return "Informe a data";
    if (!horaInicio || !horaFim) return "Informe os horários";
    if (horaFim <= horaInicio) return "Horário final deve ser após o inicial";
    if (!isEdit) {
      const dt = new Date(`${data}T${horaInicio}`);
      if (dt.getTime() < Date.now() - 60_000) return "Não é possível agendar no passado";
    }
    return null;
  }

  async function handleSubmit() {
    const erro = validar();
    if (erro) {
      toast.error(erro);
      return;
    }
    if (!isEdit && recorrencia !== "nao" && !confirmRecOpen) {
      setConfirmRecOpen(true);
      return;
    }
    setSaving(true);
    try {
      const input: AgendamentoInput = {
        paciente_id: paciente!.id,
        profissional_id: profissionalId,
        servico_id: servicoId || null,
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        tipo,
        observacoes: observacoes.trim() || null,
      };

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
      } else if (recorrencia === "nao") {
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
        await createAgendamento(input);
        toast.success("Agendamento criado");
      } else {
        const r = await createAgendamentosRecorrentes(input, recorrencia);
        if (r.criados === 0) {
          toast.error("Todos os horários estavam em conflito");
          setSaving(false);
          return;
        }
        toast.success(
          `${r.criados} agendamento(s) criado(s)` +
            (r.conflitos.length ? ` — ${r.conflitos.length} pulado(s) por conflito` : ""),
        );
      }

      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar agendamento");
    } finally {
      setSaving(false);
      setConfirmRecOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
              <Label>Procedimento *</Label>
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

          {!isEdit && (
            <div className="space-y-1">
              <Label>Recorrência</Label>
              <Select value={recorrencia} onValueChange={(v) => setRecorrencia(v as Recorrencia)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não se repete</SelectItem>
                  <SelectItem value="semanal">Semanal (4 ocorrências)</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal (4 ocorrências)</SelectItem>
                  <SelectItem value="mensal">Mensal (3 ocorrências)</SelectItem>
                </SelectContent>
              </Select>
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
            disabled={saving}
            className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>

        <AlertDialog open={confirmRecOpen} onOpenChange={setConfirmRecOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Criar agendamentos recorrentes?</AlertDialogTitle>
              <AlertDialogDescription>
                Serão criados {ocorrenciasCount} agendamentos. Horários em conflito serão ignorados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}