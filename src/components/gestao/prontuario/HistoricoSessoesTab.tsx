import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dataDesdePeriodo,
  evolucoesIdsPorAgendamento,
  formatDataBr,
  listAgendamentosDoPaciente,
  PERIODO_LABEL,
  type PeriodoFiltro,
} from "@/lib/evolucoes";
import { STATUS_LABEL, STATUS_STYLES, type AgendamentoStatus } from "@/lib/agendamentos";
import type { Paciente } from "@/lib/pacientes";
import { EvolucaoFormDialog } from "./EvolucaoFormDialog";

const STATUS_OPTIONS: (AgendamentoStatus | "todos")[] = [
  "todos",
  "agendado",
  "confirmado",
  "atendido",
  "faltou",
  "cancelado",
];

export function HistoricoSessoesTab({ paciente }: { paciente: Paciente }) {
  const [status, setStatus] = useState<AgendamentoStatus | "todos">("todos");
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("tudo");
  const [open, setOpen] = useState(false);
  const [agendamentoSel, setAgendamentoSel] = useState<string | null>(null);

  const agendamentosQ = useQuery({
    queryKey: ["historico-paciente", paciente.id],
    queryFn: () => listAgendamentosDoPaciente(paciente.id),
  });

  const evolMapQ = useQuery({
    queryKey: ["evolucoes-map", paciente.id],
    queryFn: () => evolucoesIdsPorAgendamento(paciente.id),
  });

  const filtrados = useMemo(() => {
    const lista = agendamentosQ.data ?? [];
    const desde = dataDesdePeriodo(periodo);
    return lista.filter((a) => {
      if (status !== "todos" && a.status !== status) return false;
      if (desde && a.data < desde) return false;
      return true;
    });
  }, [agendamentosQ.data, status, periodo]);

  const evolMap = evolMapQ.data ?? new Map<string, string>();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "todos" ? "Todos" : STATUS_LABEL[s as AgendamentoStatus]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Período</label>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoFiltro)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIODO_LABEL) as PeriodoFiltro[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {PERIODO_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {agendamentosQ.isLoading && (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!agendamentosQ.isLoading && filtrados.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Nenhum agendamento encontrado.
        </div>
      )}

      {filtrados.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Horário</th>
                <th className="px-3 py-2">Profissional</th>
                <th className="px-3 py-2">Procedimento</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Evolução</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map((a) => {
                const prof = (a as { profissional?: { nome?: string } | null }).profissional?.nome ?? "—";
                const serv = (a as { servico?: { nome?: string } | null }).servico?.nome ?? "—";
                const temEvolucao = evolMap.has(a.id);
                const stStyle = STATUS_STYLES[a.status as AgendamentoStatus];
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{formatDataBr(a.data)}</td>
                    <td className="px-3 py-2">{a.hora_inicio.slice(0, 5)}</td>
                    <td className="px-3 py-2">{prof}</td>
                    <td className="px-3 py-2">{serv}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${stStyle}`}>
                        {STATUS_LABEL[a.status as AgendamentoStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {temEvolucao ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <Check className="h-4 w-4" /> Registrada
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAgendamentoSel(a.id);
                            setOpen(true);
                          }}
                        >
                          Registrar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EvolucaoFormDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setAgendamentoSel(null);
        }}
        pacienteId={paciente.id}
        agendamentoIdInicial={agendamentoSel}
      />
    </div>
  );
}