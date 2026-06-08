import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, DollarSign, AlertTriangle, Clock, Activity, CheckCircle2, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  backfillLancamentosMes,
  deleteLancamento,
  FORMA_LABEL,
  formatBRL,
  listLancamentos,
  mesAtual,
  resumoMes,
  statusEfetivo,
  STATUS_LABEL,
  STATUS_STYLES,
  type LancamentoComJoin,
  type ResumoMes,
} from "@/lib/financeiro";
import { LancamentoFormDialog } from "./LancamentoFormDialog";
import { RegistrarPagamentoDialog } from "./RegistrarPagamentoDialog";
import type { Paciente } from "@/lib/pacientes";

function KpiBox({
  label, value, Icon, tone = "default",
}: { label: string; value: string; Icon: typeof DollarSign; tone?: "default" | "danger" | "warn" | "success" }) {
  const toneCls =
    tone === "danger" ? "text-red-700" :
    tone === "warn" ? "text-amber-700" :
    tone === "success" ? "text-green-700" : "text-gray-900";
  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#FEF3E8] p-2">
          <Icon className="h-5 w-5 text-[#D67F43]" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
          <div className={`text-2xl font-semibold ${toneCls}`}>{value}</div>
        </div>
      </div>
    </div>
  );
}

export function FinanceiroPacienteTab({ paciente }: { paciente: Paciente }) {
  const [mes, setMes] = useState<string>(mesAtual());
  const [lancamentos, setLancamentos] = useState<LancamentoComJoin[]>([]);
  const [resumo, setResumo] = useState<ResumoMes | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [recontabilizando, setRecontabilizando] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const [l, r] = await Promise.all([
        listLancamentos({ mes, pacienteId: paciente.id }),
        resumoMes(mes, paciente.id),
      ]);
      setLancamentos(l);
      setResumo(r);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void carregar(); /* eslint-disable-next-line */ }, [mes, paciente.id]);

  async function handleDelete(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await deleteLancamento(id);
      toast.success("Lançamento excluído");
      void carregar();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao excluir");
    }
  }

  async function handleRecontabilizar() {
    setRecontabilizando(true);
    try {
      const n = await backfillLancamentosMes(paciente.id, mes);
      toast.success(n > 0 ? `${n} lançamento(s) gerado(s)` : "Nada a recontabilizar");
      void carregar();
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    } finally {
      setRecontabilizando(false);
    }
  }

  const toggleAll = (v: boolean) => {
    if (!v) return setSelected(new Set());
    setSelected(new Set(lancamentos.filter((l) => l.status === "pendente").map((l) => l.id)));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiBox label="Recebido no mês" value={formatBRL(resumo?.receita_paga_centavos ?? 0)} Icon={DollarSign} tone="success" />
        <KpiBox label="A receber" value={formatBRL(resumo?.a_receber_centavos ?? 0)} Icon={Clock} tone="warn" />
        <KpiBox label="Atrasados" value={formatBRL(resumo?.atrasados_centavos ?? 0)} Icon={AlertTriangle} tone="danger" />
        <KpiBox label="Sessões atendidas" value={String(resumo?.sessoes_atendidas ?? 0)} Icon={Activity} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="w-44" />
        <Button variant="outline" onClick={handleRecontabilizar} disabled={recontabilizando}>
          <RefreshCw className={`mr-2 h-4 w-4 ${recontabilizando ? "animate-spin" : ""}`} />
          Recontabilizar mês
        </Button>
        <div className="ml-auto flex gap-2">
          {selected.size > 0 && (
            <Button onClick={() => setPayOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Registrar pagamento ({selected.size})
            </Button>
          )}
          <Button onClick={() => setFormOpen(true)} className="bg-gradient-to-r from-[#D67F43] to-[#E89B6D] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo lançamento
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-amber-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="w-10 px-3 py-2">
                <Checkbox
                  checked={selected.size > 0 && selected.size === lancamentos.filter((l) => l.status === "pendente").length}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                />
              </th>
              <th className="px-3 py-2">Vencimento</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Forma</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">Carregando...</td></tr>
            ) : lancamentos.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">Nenhum lançamento neste mês.</td></tr>
            ) : (
              lancamentos.map((l) => {
                const st = statusEfetivo(l);
                const isPend = l.status === "pendente";
                return (
                  <tr key={l.id} className="border-t border-amber-50">
                    <td className="px-3 py-2">
                      {isPend && (
                        <Checkbox
                          checked={selected.has(l.id)}
                          onCheckedChange={(v) => {
                            const next = new Set(selected);
                            if (v) next.add(l.id); else next.delete(l.id);
                            setSelected(next);
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">{l.data_vencimento.split("-").reverse().join("/")}</td>
                    <td className="px-3 py-2">{l.descricao}</td>
                    <td className="px-3 py-2 font-medium">{formatBRL(l.valor_centavos)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[st]}`}>{STATUS_LABEL[st]}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{l.forma_pagamento ? FORMA_LABEL[l.forma_pagamento] : "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(l.id)} className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <LancamentoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() => void carregar()}
        pacienteFixo={{ id: paciente.id, nome: paciente.nome }}
      />
      <RegistrarPagamentoDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        ids={Array.from(selected)}
        onSaved={() => void carregar()}
      />
    </div>
  );
}