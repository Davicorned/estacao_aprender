import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEvolucao,
  type EvolucaoComJoin,
  type EvolucaoInput,
  getProfissionalDoUsuarioLogado,
  listAgendamentosDoDiaPaciente,
  listProfissionaisAtivos,
  updateEvolucao,
} from "@/lib/evolucoes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: string;
  evolucao?: EvolucaoComJoin | null;
  agendamentoIdInicial?: string | null;
};

function hoje(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function EvolucaoFormDialog({
  open,
  onOpenChange,
  pacienteId,
  evolucao,
  agendamentoIdInicial = null,
}: Props) {
  const qc = useQueryClient();
  const isEdit = Boolean(evolucao);

  const [profissionalId, setProfissionalId] = useState<string>("");
  const [dataSessao, setDataSessao] = useState<string>(hoje());
  const [agendamentoId, setAgendamentoId] = useState<string>("");
  const [queixa, setQueixa] = useState("");
  const [observacao, setObservacao] = useState("");
  const [evolucaoTxt, setEvolucaoTxt] = useState("");
  const [instrumentos, setInstrumentos] = useState("");
  const [plano, setPlano] = useState("");
  const [encaminhamentos, setEncaminhamentos] = useState("");
  const [privado, setPrivado] = useState(false);

  const profissionaisQ = useQuery({
    queryKey: ["profissionais-ativos"],
    queryFn: listProfissionaisAtivos,
    enabled: open,
  });

  const meuProfQ = useQuery({
    queryKey: ["meu-profissional"],
    queryFn: getProfissionalDoUsuarioLogado,
    enabled: open && !isEdit,
  });

  const agendamentosDiaQ = useQuery({
    queryKey: ["agendamentos-do-dia", pacienteId, dataSessao],
    queryFn: () => listAgendamentosDoDiaPaciente(pacienteId, dataSessao),
    enabled: open,
  });

  // Inicialização ao abrir
  useEffect(() => {
    if (!open) return;
    if (evolucao) {
      setProfissionalId(evolucao.profissional_id);
      setDataSessao(evolucao.data_sessao);
      setAgendamentoId(evolucao.agendamento_id ?? "");
      setQueixa(evolucao.queixa ?? "");
      setObservacao(evolucao.observacao ?? "");
      setEvolucaoTxt(evolucao.evolucao ?? "");
      setInstrumentos(evolucao.instrumentos ?? "");
      setPlano(evolucao.plano ?? "");
      setEncaminhamentos(evolucao.encaminhamentos ?? "");
      setPrivado(evolucao.privado);
    } else {
      setProfissionalId("");
      setDataSessao(hoje());
      setAgendamentoId(agendamentoIdInicial ?? "");
      setQueixa("");
      setObservacao("");
      setEvolucaoTxt("");
      setInstrumentos("");
      setPlano("");
      setEncaminhamentos("");
      setPrivado(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, evolucao?.id]);

  // Auto-preencher profissional com o logado (apenas em criação)
  useEffect(() => {
    if (isEdit) return;
    if (!profissionalId && meuProfQ.data) setProfissionalId(meuProfQ.data);
  }, [meuProfQ.data, profissionalId, isEdit]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!profissionalId) throw new Error("Selecione o profissional");
      if (!dataSessao) throw new Error("Informe a data");
      const input: EvolucaoInput = {
        paciente_id: pacienteId,
        profissional_id: profissionalId,
        agendamento_id: agendamentoId || null,
        data_sessao: dataSessao,
        queixa: queixa.trim() || null,
        observacao: observacao.trim() || null,
        evolucao: evolucaoTxt.trim() || null,
        instrumentos: instrumentos.trim() || null,
        plano: plano.trim() || null,
        encaminhamentos: encaminhamentos.trim() || null,
        privado,
      };
      if (evolucao) await updateEvolucao(evolucao.id, input);
      else await createEvolucao(input);
    },
    onSuccess: () => {
      toast.success(evolucao ? "Evolução atualizada" : "Evolução registrada");
      void qc.invalidateQueries({ queryKey: ["evolucoes", pacienteId] });
      void qc.invalidateQueries({ queryKey: ["historico-paciente", pacienteId] });
      onOpenChange(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error((err as Error).message || "Erro ao salvar evolução");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{evolucao ? "Editar evolução" : "Nova evolução"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Profissional *</Label>
              <Select value={profissionalId} onValueChange={setProfissionalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {(profissionaisQ.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                      {p.titulo ? ` — ${p.titulo}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Data da sessão *</Label>
              <Input
                type="date"
                value={dataSessao}
                onChange={(e) => setDataSessao(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Vincular a agendamento (opcional)</Label>
            <Select
              value={agendamentoId || "none"}
              onValueChange={(v) => setAgendamentoId(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem vínculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem vínculo</SelectItem>
                {(agendamentosDiaQ.data ?? []).map((a) => {
                  const prof = (a as { profissional?: { nome?: string } | null }).profissional?.nome ?? "";
                  const serv = (a as { servico?: { nome?: string } | null }).servico?.nome ?? "";
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {a.hora_inicio.slice(0, 5)} • {serv || "Atendimento"}
                      {prof ? ` — ${prof}` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Registro da sessão
          </div>

          <Campo
            label="Queixa / Demanda"
            ajuda="O que trouxe o paciente/responsável hoje"
            value={queixa}
            onChange={setQueixa}
            rows={3}
          />
          <Campo
            label="Observação da sessão"
            ajuda="Descrição detalhada do que aconteceu na sessão"
            value={observacao}
            onChange={setObservacao}
            rows={6}
          />
          <Campo
            label="Evolução"
            ajuda="Progresso observado em relação às sessões anteriores"
            value={evolucaoTxt}
            onChange={setEvolucaoTxt}
            rows={4}
          />
          <Campo
            label="Instrumentos utilizados"
            ajuda="Testes, jogos, materiais usados"
            value={instrumentos}
            onChange={setInstrumentos}
            rows={2}
          />
          <Campo
            label="Plano terapêutico"
            ajuda="Próximos passos, objetivos para próxima sessão"
            value={plano}
            onChange={setPlano}
            rows={3}
          />
          <Campo
            label="Encaminhamentos"
            ajuda="Encaminhamento para outros profissionais, se houver"
            value={encaminhamentos}
            onChange={setEncaminhamentos}
            rows={2}
          />

          <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
            <div>
              <Label className="text-sm">Registro privado</Label>
              <p className="text-xs text-gray-500">
                Apenas você poderá visualizar esta evolução.
              </p>
            </div>
            <Switch checked={privado} onCheckedChange={setPrivado} />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar evolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  label,
  ajuda,
  value,
  onChange,
  rows,
}: {
  label: string;
  ajuda?: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      {ajuda && <p className="text-xs text-gray-500">{ajuda}</p>}
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}