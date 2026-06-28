import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarClock, Check, Pencil, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  deleteAgendamento,
  STATUS_LABEL,
  STATUS_STYLES,
  updateStatus,
  type AgendamentoComJoin,
  type AgendamentoStatus,
} from "@/lib/agendamentos";

export type DetalhesDialogProps = {
  agendamento: AgendamentoComJoin | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: (a: AgendamentoComJoin) => void;
  onChanged?: () => void;
};

export function AgendamentoDetalhesDialog({
  agendamento,
  open,
  onOpenChange,
  onEdit,
  onChanged,
}: DetalhesDialogProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);

  if (!agendamento) return null;

  async function mudarStatus(novo: AgendamentoStatus, motivoTxt?: string) {
    if (!agendamento) return;
    try {
      setBusy(true);
      await updateStatus(agendamento.id, novo, motivoTxt);
      toast.success(`Status: ${STATUS_LABEL[novo]}`);
      onChanged?.();
      if (novo === "atendido") setFinalizeOpen(true);
      else onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar status");
    } finally {
      setBusy(false);
      setCancelOpen(false);
      setMotivo("");
    }
  }

  async function handleDelete() {
    if (!agendamento) return;
    try {
      setBusy(true);
      await deleteAgendamento(agendamento.id);
      toast.success("Agendamento excluído");
      onChanged?.();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir");
    } finally {
      setBusy(false);
      setDeleteOpen(false);
    }
  }

  const { paciente, profissional, servico, status, data, hora_inicio, hora_fim, tipo } = agendamento;

  type AcaoDupla = {
    positiva?: { label: string; onClick: () => void };
    negativa?: { label: string; onClick: () => void };
  };

  const acoes: AcaoDupla = (() => {
    if (status === "agendado") {
      return {
        positiva: { label: "Confirmar", onClick: () => mudarStatus("confirmado") },
        negativa: { label: "Cancelar", onClick: () => setCancelOpen(true) },
      };
    }
    if (status === "confirmado") {
      return {
        positiva: { label: "Marcar como atendido", onClick: () => mudarStatus("atendido") },
        negativa: { label: "Paciente faltou", onClick: () => mudarStatus("faltou") },
      };
    }
    if (status === "em_atendimento") {
      return {
        positiva: { label: "Finalizar atendimento", onClick: () => mudarStatus("atendido") },
        negativa: { label: "Paciente faltou", onClick: () => mudarStatus("faltou") },
      };
    }
    return {};
  })();

  const temAcoes = !!(acoes.positiva || acoes.negativa);
  const podeRemarcar = status !== "atendido" && status !== "cancelado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Paciente</p>
            {paciente ? (
              <Link
                to="/gestao/pacientes/$id"
                params={{ id: paciente.id }}
                className="font-medium text-[#B85A24] hover:underline"
              >
                {paciente.nome}
              </Link>
            ) : (
              <p className="text-gray-400">—</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Profissional</p>
              <p className="font-medium">{profissional?.nome ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Procedimento</p>
              <p className="font-medium">{servico?.nome ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Data</p>
              <p className="font-medium">{data.split("-").reverse().join("/")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Horário</p>
              <p className="font-medium">{hora_inicio.slice(0, 5)} – {hora_fim.slice(0, 5)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tipo</p>
              <p className="font-medium capitalize">{tipo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <span className={`inline-block rounded border px-2 py-0.5 text-xs ${STATUS_STYLES[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            </div>
          </div>
          {agendamento.observacoes && (
            <div>
              <p className="text-xs text-gray-500">Observações</p>
              <p className="whitespace-pre-wrap text-gray-700">{agendamento.observacoes}</p>
            </div>
          )}
          {agendamento.motivo_cancelamento && (
            <div>
              <p className="text-xs text-gray-500">Motivo do cancelamento</p>
              <p className="text-gray-700">{agendamento.motivo_cancelamento}</p>
            </div>
          )}
        </div>

        {temAcoes && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {acoes.positiva && (
              <Button
                disabled={busy}
                onClick={acoes.positiva.onClick}
                className="bg-[#B85A24] text-white hover:bg-[#a04d1e]"
              >
                <Check className="mr-1.5 h-4 w-4" />
                {acoes.positiva.label}
              </Button>
            )}
            {acoes.negativa && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={acoes.negativa.onClick}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="mr-1.5 h-4 w-4" />
                {acoes.negativa.label}
              </Button>
            )}
          </div>
        )}

        {podeRemarcar && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onEdit(agendamento)}
            className="w-full"
          >
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Remarcar
          </Button>
        )}

        <DialogFooter className="mt-2 flex-row items-center justify-between border-t pt-3 sm:justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onEdit(agendamento)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setDeleteOpen(true)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Excluir
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>

        {/* Cancel motivo */}
        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
              <AlertDialogDescription>Informe o motivo (opcional).</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-1">
              <Label>Motivo</Label>
              <Textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={() => mudarStatus("cancelado", motivo)}>
                Confirmar cancelamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Excluir */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação é permanente.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Pós-finalização */}
        <AlertDialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registrar evolução no prontuário?</AlertDialogTitle>
              <AlertDialogDescription>
                O registro de prontuário será implementado na Fase 4. Por enquanto você pode apenas fechar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setFinalizeOpen(false);
                  onOpenChange(false);
                }}
              >
                Mais tarde
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setFinalizeOpen(false);
                  onOpenChange(false);
                  toast.info("Disponível na Fase 4 (Prontuário)");
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}