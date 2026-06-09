import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  UserPlus,
  Pencil,
  MessageSquarePlus,
  MessageCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Paciente } from "@/lib/pacientes";
import {
  listHistorico,
  registrarComentario,
  categoriaDoTipo,
  type HistoricoCategoria,
  type HistoricoEvento,
  type HistoricoTipo,
} from "@/lib/historico";

const ICON_MAP: Record<HistoricoTipo, typeof Calendar> = {
  paciente_criado: UserPlus,
  paciente_editado: Pencil,
  agendamento_criado: Calendar,
  agendamento_remarcado: CalendarClock,
  agendamento_cancelado: CalendarX,
  agendamento_atendido: CheckCircle2,
  agendamento_faltou: XCircle,
  contrato_criado: FileText,
  contrato_encerrado: FileText,
  evolucao_registrada: FileText,
  lancamento_pago: DollarSign,
  lancamento_gerado: DollarSign,
  lancamento_status_alterado: DollarSign,
  comentario: MessageCircle,
};

const CATEGORIA_COLOR: Record<HistoricoCategoria, string> = {
  agendamento: "bg-green-100 text-green-700 ring-green-200",
  clinico: "bg-blue-100 text-blue-700 ring-blue-200",
  financeiro: "bg-amber-100 text-amber-700 ring-amber-200",
  cadastro: "bg-purple-100 text-purple-700 ring-purple-200",
  comentario: "bg-gray-100 text-gray-600 ring-gray-200",
};

function fmtData(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

export function HistoricoTab({ paciente }: { paciente: Paciente }) {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<HistoricoCategoria | "todos">("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comentario, setComentario] = useState("");
  const [salvando, setSalvando] = useState(false);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["historico", paciente.id, filtro],
    queryFn: () => listHistorico({ pacienteId: paciente.id, categoria: filtro }),
  });

  async function salvarComentario() {
    const t = comentario.trim();
    if (!t) return;
    setSalvando(true);
    try {
      await registrarComentario(paciente.id, t);
      toast.success("Comentário adicionado");
      setComentario("");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["historico", paciente.id] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao adicionar comentário");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Histórico</h3>
          <p className="text-sm text-gray-500">Linha do tempo de atividades do paciente</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filtro} onValueChange={(v) => setFiltro(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="agendamento">Agendamentos</SelectItem>
              <SelectItem value="clinico">Clínico</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="cadastro">Cadastro</SelectItem>
              <SelectItem value="comentario">Comentários</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Comentário
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : eventos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Nenhum evento registrado ainda.
        </div>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-amber-100 pl-6">
          {eventos.map((ev: HistoricoEvento) => {
            const Icon = ICON_MAP[ev.tipo] ?? MessageCircle;
            const cat = categoriaDoTipo(ev.tipo);
            const colorClass = CATEGORIA_COLOR[cat];
            return (
              <li key={ev.id} className="relative">
                <span
                  className={`absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full ring-2 ${colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm text-gray-900">{ev.descricao}</div>
                    <div className="shrink-0 text-xs text-gray-500">{fmtData(ev.created_at)}</div>
                  </div>
                  {ev.autor_nome && (
                    <div className="mt-1 text-xs text-gray-500">por {ev.autor_nome}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar comentário</DialogTitle>
          </DialogHeader>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escreva uma observação para o histórico..."
            rows={5}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={salvarComentario} disabled={salvando || !comentario.trim()}>
              {salvando ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <MessageSquarePlus className="mr-1 h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}