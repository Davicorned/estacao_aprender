import { useEffect, useMemo, useState } from "react";
import { Plus, DollarSign, AlertTriangle, Clock, Activity, CheckCircle2, MoreHorizontal, Pencil, RotateCcw, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  alterarStatusLancamento,
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
  type LancamentoStatus,
  type LancamentoTipo,
  type ResumoMes,
} from "@/lib/financeiro";
import { LancamentoFormDialog } from "./LancamentoFormDialog";
import { RegistrarPagamentoDialog } from "./RegistrarPagamentoDialog";

function KpiBox({
  label,
  value,
  Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  Icon: typeof DollarSign;
  hint?: string;
  tone?: "default" | "danger" | "warn" | "success";
}) {
  const toneCls =
    tone === "danger"
      ? "text-red-700"
      : tone === "warn"
      ? "text-amber-700"
      : tone === "success"
      ? "text-green-700"
      : "text-gray-900";
  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#FEF3E8] p-2">
          <Icon className="h-5 w-5 text-[#D67F43]" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
          <div className={`text-2xl font-semibold ${toneCls}`}>{value}</div>
          {hint && <div className="text-xs text-gray-500">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

export function FinanceiroPage() {
  const [mes, setMes] = useState<string>(mesAtual());
  const [status, setStatus] = useState<LancamentoStatus | "todos">("todos");
  const [tipo, setTipo] = useState<LancamentoTipo | "todos">("todos");
  const [busca, setBusca] = useState<string>("");

  const [lancamentos, setLancamentos] = useState<LancamentoComJoin[]>([]);
  const [resumo, setResumo] = useState<ResumoMes | null>(null);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<LancamentoComJoin | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  async function carregar() {
    setLoading(true);
    const [l, r] = await Promise.all([
      listLancamentos({ mes, status, tipo }),
      resumoMes(mes),
    ]);
    setLancamentos(l);
    setResumo(r);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, status, tipo]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return lancamentos;
    const q = busca.toLowerCase();
    return lancamentos.filter(
      (l) =>
        l.descricao.toLowerCase().includes(q) ||
        l.paciente?.nome.toLowerCase().includes(q)
    );
  }, [lancamentos, busca]);

  function toggleSel(id: string) {
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const pendentesSelecionados = useMemo(
    () => filtrados.filter((l) => selecionados.has(l.id) && l.status === "pendente").map((l) => l.id),
    [filtrados, selecionados]
  );

  async function handleDelete(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await deleteLancamento(id);
      toast.success("Lançamento excluído");
      carregar();
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    }
  }

  async function handleAlterarStatus(id: string, novo: LancamentoStatus) {
    try {
      await alterarStatusLancamento(id, novo);
      toast.success(`Marcado como ${STATUS_LABEL[novo]}`);
      carregar();
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    }
  }

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiBox
          label="Receita do mês"
          value={formatBRL(resumo?.receita_paga_centavos ?? 0)}
          Icon={DollarSign}
          tone="success"
        />
        <KpiBox
          label="A receber"
          value={formatBRL(resumo?.a_receber_centavos ?? 0)}
          Icon={Clock}
          tone="warn"
        />
        <KpiBox
          label="Atrasados"
          value={formatBRL(resumo?.atrasados_centavos ?? 0)}
          Icon={AlertTriangle}
          tone="danger"
        />
        <KpiBox
          label="Sessões no mês"
          value={String(resumo?.sessoes_atendidas ?? 0)}
          Icon={Activity}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="w-40"
        />
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {(["pendente", "pago", "atrasado", "cancelado"] as LancamentoStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por paciente/descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-72"
        />

        <div className="ml-auto flex gap-2">
          {pendentesSelecionados.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setPayOpen(true)}
              className="border-green-600 text-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Registrar pagamento ({pendentesSelecionados.length})
            </Button>
          )}
          <Button
            onClick={() => { setEditando(null); setFormOpen(true); }}
            className="bg-gradient-to-r from-[#D67F43] to-[#E89B6D] text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-amber-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 text-amber-900">
            <tr>
              <th className="px-3 py-3 w-8"></th>
              <th className="px-3 py-3 text-left">Vencimento</th>
              <th className="px-3 py-3 text-left">Paciente</th>
              <th className="px-3 py-3 text-left">Descrição</th>
              <th className="px-3 py-3 text-left">Valor</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Forma pgto</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">Carregando…</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">Nenhum lançamento.</td></tr>
            ) : (
              filtrados.map((l) => {
                const eff = statusEfetivo(l);
                return (
                  <tr key={l.id} className="border-t border-amber-50 hover:bg-amber-50/40">
                    <td className="px-3 py-2">
                      {l.status === "pendente" && (
                        <Checkbox
                          checked={selecionados.has(l.id)}
                          onCheckedChange={() => toggleSel(l.id)}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">{l.data_vencimento.split("-").reverse().join("/")}</td>
                    <td className="px-3 py-2">{l.paciente?.nome ?? "—"}</td>
                    <td className="px-3 py-2">{l.descricao}</td>
                    <td className="px-3 py-2 font-medium">{formatBRL(l.valor_centavos)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[eff]}`}>
                        {STATUS_LABEL[eff]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {l.forma_pagamento ? FORMA_LABEL[l.forma_pagamento] : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onClick={() => { setEditando(l); setFormOpen(true); }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          {l.status === "pendente" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelecionados(new Set([l.id]));
                                setPayOpen(true);
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-700" />
                              Marcar como pago
                            </DropdownMenuItem>
                          )}
                          {l.status !== "pendente" && (
                            <DropdownMenuItem onClick={() => handleAlterarStatus(l.id, "pendente")}>
                              <RotateCcw className="mr-2 h-4 w-4" /> Marcar como pendente
                            </DropdownMenuItem>
                          )}
                          {l.status !== "cancelado" && (
                            <DropdownMenuItem onClick={() => handleAlterarStatus(l.id, "cancelado")}>
                              <XCircle className="mr-2 h-4 w-4" /> Cancelar lançamento
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => handleDelete(l.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditando(null); }}
        onSaved={() => carregar()}
        lancamento={editando}
      />
      <RegistrarPagamentoDialog
        open={payOpen}
        onOpenChange={(v: boolean) => {
          setPayOpen(v);
          if (!v) setSelecionados(new Set());
        }}
        ids={pendentesSelecionados.length > 0 ? pendentesSelecionados : Array.from(selecionados)}
        onSaved={() => {
          setSelecionados(new Set());
          carregar();
        }}
      />
    </div>
  );
}