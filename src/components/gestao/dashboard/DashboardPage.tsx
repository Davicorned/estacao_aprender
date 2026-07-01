import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Users, Calendar, Activity, DollarSign, ArrowRight, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  atendimentosPorDia,
  fetchKpis,
  pacientesNovosVsRecorrentes,
  proximosAgendamentos,
  proximosLancamentosAReceber,
  rangeMesAtual,
  rangeMesPassado,
  rangeUltimos30,
  type Kpis,
  type PeriodoRange,
  type PontoDia,
} from "@/lib/dashboard";
import { fetchProfissionais, formatBRL, type Profissional } from "@/lib/configuracoes";
import { statusEfetivo, STATUS_LABEL, STATUS_STYLES } from "@/lib/financeiro";

const DashboardCharts = lazy(() => import("./DashboardCharts"));

type PeriodoOpt = "30d" | "mes_atual" | "mes_passado";

function rangeFromOpt(opt: PeriodoOpt): PeriodoRange {
  if (opt === "30d") return rangeUltimos30();
  if (opt === "mes_passado") return rangeMesPassado();
  return rangeMesAtual();
}

function VarBadge({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`mt-1 inline-flex items-center gap-1 text-xs ${up ? "text-green-700" : "text-red-700"}`}>
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}
      {pct}% vs período anterior
    </span>
  );
}

function KpiCard({
  label,
  value,
  Icon,
  pct,
}: {
  label: string;
  value: string;
  Icon: typeof Users;
  pct: number | null;
}) {
  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
          <VarBadge pct={pct} />
        </div>
        <div className="rounded-lg bg-[#FEF3E8] p-2">
          <Icon className="h-6 w-6 text-[#D67F43]" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [periodoOpt, setPeriodoOpt] = useState<PeriodoOpt>("mes_atual");
  const [profId, setProfId] = useState<string>("todos");
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  const range = useMemo(() => rangeFromOpt(periodoOpt), [periodoOpt]);

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [serie, setSerie] = useState<PontoDia[]>([]);
  const [pacientesDist, setPacientesDist] = useState({ novos: 0, recorrentes: 0 });
  const [proxAg, setProxAg] = useState<any[]>([]);
  const [proxLanc, setProxLanc] = useState<any[]>([]);

  useEffect(() => {
    fetchProfissionais(false).then(setProfissionais);
  }, []);

  useEffect(() => {
    const prof = profId === "todos" ? null : profId;
    fetchKpis(range, prof).then(setKpis);
    atendimentosPorDia(range, prof).then(setSerie);
    pacientesNovosVsRecorrentes(range).then(setPacientesDist);
    proximosAgendamentos(5).then(setProxAg);
    proximosLancamentosAReceber(5).then(setProxLanc);
  }, [range, profId]);

  const donutData = [
    { name: "Recorrentes", value: pacientesDist.recorrentes },
    { name: "Novos", value: pacientesDist.novos },
  ];
  const donutColors = ["#D67F43", "#FBCF9E"];

  const lineData = serie.map((s) => ({
    dia: s.data.slice(8, 10),
    total: s.total,
  }));

  return (
    <div className="space-y-6">
      {/* Filtros globais */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={periodoOpt} onValueChange={(v) => setPeriodoOpt(v as PeriodoOpt)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="mes_atual">Este mês</SelectItem>
            <SelectItem value="mes_passado">Último mês</SelectItem>
          </SelectContent>
        </Select>

        {profissionais.length > 1 && (
          <Select value={profId} onValueChange={setProfId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os profissionais</SelectItem>
              {profissionais.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Row 1: KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Pacientes cadastrados"
          value={String(kpis?.pacientes_ativos ?? "—")}
          Icon={Users}
          pct={null}
        />
        <KpiCard
          label="Agendamentos hoje"
          value={String(kpis?.agendamentos_hoje ?? "—")}
          Icon={Calendar}
          pct={null}
        />
        <KpiCard
          label="Sessões no período"
          value={String(kpis?.sessoes_mes ?? "—")}
          Icon={Activity}
          pct={kpis?.variacao_sessoes_pct ?? null}
        />
        <KpiCard
          label="Pacientes remarcados"
          value={String(kpis?.pacientes_remarcados ?? "—")}
          Icon={RefreshCw}
          pct={kpis?.variacao_remarcados_pct ?? null}
        />
        <KpiCard
          label="Receita do período"
          value={formatBRL(kpis?.receita_mes_centavos ?? 0)}
          Icon={DollarSign}
          pct={kpis?.variacao_receita_pct ?? null}
        />
      </div>

      {/* Row 2: Charts */}
      <Suspense
        fallback={
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-72 rounded-xl border border-amber-100 bg-white" />
            <div className="h-72 rounded-xl border border-amber-100 bg-white" />
          </div>
        }
      >
        <DashboardCharts lineData={lineData} donutData={donutData} donutColors={donutColors} />
      </Suspense>

      {/* Row 3 / Row 4 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Próximos agendamentos</h3>
            <Link to="/gestao/agenda" className="text-sm text-[#D67F43] hover:underline">
              Ver agenda completa <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-amber-50">
            {proxAg.length === 0 && (
              <li className="py-6 text-center text-sm text-gray-500">Nada agendado para hoje/amanhã</li>
            )}
            {proxAg.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{a.hora_inicio?.slice(0, 5)} — {a.paciente?.nome}</div>
                  <div className="text-xs text-gray-500">{a.servico?.nome ?? "Atendimento"} · {a.data.split("-").reverse().join("/")}</div>
                </div>
                <span className="rounded-full bg-[#FEF3E8] px-2 py-0.5 text-xs text-[#7A3B14]">
                  {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : a.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Contas a receber</h3>
            <Link to="/gestao/financeiro" className="text-sm text-[#D67F43] hover:underline">
              Ver financeiro completo <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-amber-50">
            {proxLanc.length === 0 && (
              <li className="py-6 text-center text-sm text-gray-500">Nenhum lançamento pendente</li>
            )}
            {proxLanc.map((l) => {
              const eff = statusEfetivo(l);
              return (
                <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className={`font-medium ${eff === "atrasado" ? "text-red-700" : ""}`}>
                      {l.paciente?.nome ?? l.descricao}
                    </div>
                    <div className="text-xs text-gray-500">
                      Vencimento {l.data_vencimento.split("-").reverse().join("/")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatBRL(l.valor_centavos)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[eff]}`}>
                      {STATUS_LABEL[eff]}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}