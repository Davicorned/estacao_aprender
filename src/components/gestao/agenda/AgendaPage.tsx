import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { fetchClinica, fetchProfissionais, fetchServicos } from "@/lib/configuracoes";
import {
  blocoPosicao,
  diasIguais,
  HORA_INICIO,
  labelDia,
  labelDiaLongo,
  listAgendamentosByRange,
  parseIsoDate,
  semanaDe,
  SLOT_HEIGHT,
  SLOT_MIN,
  slotsDoDia,
  STATUS_LABEL,
  STATUS_STYLES,
  timeToMin,
  toIsoDate,
  totalSlotsDia,
  useAgendamentosRealtime,
  type AgendamentoComJoin,
} from "@/lib/agendamentos";
import { AgendamentoFormDialog } from "./AgendamentoFormDialog";
import { AgendamentoDetalhesDialog } from "./AgendamentoDetalhesDialog";

type View = "dia" | "semana";

export function AgendaPage() {
  const [view, setView] = useState<View>("semana");
  const [dataAtual, setDataAtual] = useState<Date>(new Date());
  const [profissionalId, setProfissionalId] = useState<string>("todos");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<{ data?: string; hora?: string }>({});
  const [formEdit, setFormEdit] = useState<AgendamentoComJoin | undefined>(undefined);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selecionado, setSelecionado] = useState<AgendamentoComJoin | null>(null);

  const { data: profissionais = [] } = useQuery({
    queryKey: ["profissionais-ativos"],
    queryFn: () => fetchProfissionais(false),
  });
  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos-ativos"],
    queryFn: () => fetchServicos(false),
  });
  const { data: clinica } = useQuery({
    queryKey: ["clinica"],
    queryFn: fetchClinica,
  });

  const range = useMemo(() => {
    if (view === "dia") {
      const d = toIsoDate(dataAtual);
      return { dataInicio: d, dataFim: d };
    }
    const sem = semanaDe(dataAtual);
    return { dataInicio: toIsoDate(sem[0]), dataFim: toIsoDate(sem[6]) };
  }, [view, dataAtual]);

  const queryKey = [
    "agendamentos",
    range.dataInicio,
    range.dataFim,
    profissionalId,
  ];

  const { data: agendamentos = [] } = useQuery({
    queryKey,
    queryFn: () =>
      listAgendamentosByRange({
        dataInicio: range.dataInicio,
        dataFim: range.dataFim,
        profissionalId: profissionalId === "todos" ? null : profissionalId,
      }),
  });

  useAgendamentosRealtime(["agendamentos"]);

  const dias = view === "semana" ? semanaDe(dataAtual) : [dataAtual];

  function navegar(delta: number) {
    const n = new Date(dataAtual);
    if (view === "dia") n.setDate(n.getDate() + delta);
    else n.setDate(n.getDate() + delta * 7);
    setDataAtual(n);
  }

  function abrirNovo(data?: string, hora?: string) {
    setFormEdit(undefined);
    setFormInitial({ data, hora });
    setFormOpen(true);
  }

  function abrirDetalhes(a: AgendamentoComJoin) {
    setSelecionado(a);
    setDetailsOpen(true);
  }

  function abrirEdicao(a: AgendamentoComJoin) {
    setDetailsOpen(false);
    setFormEdit(a);
    setFormInitial({});
    setFormOpen(true);
  }

  const diaSelecionadoIso = toIsoDate(dataAtual);
  const agsDoDia = agendamentos
    .filter((a) => a.data === diaSelecionadoIso)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <GestaoShell title="Agenda">
      <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <Button variant="ghost" size="icon" onClick={() => navegar(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDataAtual(new Date())}>
            Hoje
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navegar(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="ml-2 text-sm font-medium text-gray-700">
            {view === "dia" ? labelDiaLongo(dataAtual) : labelRange(dias)}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex rounded-md border border-gray-200">
              <button
                onClick={() => setView("dia")}
                className={`px-3 py-1.5 text-xs ${view === "dia" ? "bg-[#FEF3E8] text-[#B85A24]" : "text-gray-600"}`}
              >
                DIA
              </button>
              <button
                onClick={() => setView("semana")}
                className={`px-3 py-1.5 text-xs ${view === "semana" ? "bg-[#FEF3E8] text-[#B85A24]" : "text-gray-600"}`}
              >
                SEMANA
              </button>
            </div>
            <Select value={profissionalId} onValueChange={setProfissionalId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os profissionais</SelectItem>
                {profissionais.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => abrirNovo(toIsoDate(dataAtual))}
              className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Corpo */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Sidebar pacientes do dia */}
          <aside
            className={`flex shrink-0 flex-col rounded-lg border border-gray-200 bg-white transition-all ${
              sidebarOpen ? "w-64" : "w-12"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-2">
              {sidebarOpen && (
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Pacientes do dia
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((v) => !v)}>
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            </div>
            {sidebarOpen && (
              <div className="flex-1 space-y-1 overflow-y-auto p-2">
                {agsDoDia.length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-gray-400">
                    Nenhum paciente neste dia.
                  </p>
                )}
                {agsDoDia.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => abrirDetalhes(a)}
                    className="block w-full rounded-md px-2 py-1.5 text-left hover:bg-gray-50"
                  >
                    <p className="text-xs font-semibold text-gray-700">{a.hora_inicio.slice(0, 5)}</p>
                    <p className="truncate text-sm">{a.paciente?.nome ?? "—"}</p>
                    <span className={`mt-0.5 inline-block rounded border px-1.5 text-[10px] ${STATUS_STYLES[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Grid */}
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
            <AgendaGrid
              dias={dias}
              view={view}
              agendamentos={agendamentos}
              almocoInicio={clinica?.horario_almoco_inicio ?? null}
              almocoFim={clinica?.horario_almoco_fim ?? null}
              onSlotClick={(data, hora) => abrirNovo(data, hora)}
              onBlocoClick={abrirDetalhes}
            />
          </div>
        </div>
      </div>

      <AgendamentoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        profissionais={profissionais}
        servicos={servicos}
        profissionalIdInicial={
          profissionalId !== "todos" ? profissionalId : profissionais[0]?.id
        }
        dataInicial={formInitial.data}
        horaInicial={formInitial.hora}
        agendamento={formEdit}
      />

      <AgendamentoDetalhesDialog
        agendamento={selecionado}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={abrirEdicao}
      />
    </GestaoShell>
  );
}

function labelRange(dias: Date[]): string {
  const a = dias[0];
  const b = dias[dias.length - 1];
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(a)} – ${fmt(b)}/${b.getFullYear()}`;
}

function AgendaGrid({
  dias,
  view,
  agendamentos,
  almocoInicio,
  almocoFim,
  onSlotClick,
  onBlocoClick,
}: {
  dias: Date[];
  view: View;
  agendamentos: AgendamentoComJoin[];
  almocoInicio: string | null;
  almocoFim: string | null;
  onSlotClick: (data: string, hora: string) => void;
  onBlocoClick: (a: AgendamentoComJoin) => void;
}) {
  const slots = slotsDoDia();
  const total = totalSlotsDia();
  const altura = total * SLOT_HEIGHT;
  const hoje = new Date();

  // Almoço box
  let almocoTop = 0;
  let almocoAltura = 0;
  if (almocoInicio && almocoFim) {
    const base = timeToMin(HORA_INICIO);
    almocoTop = ((timeToMin(almocoInicio.slice(0, 5)) - base) / SLOT_MIN) * SLOT_HEIGHT;
    almocoAltura =
      ((timeToMin(almocoFim.slice(0, 5)) - timeToMin(almocoInicio.slice(0, 5))) / SLOT_MIN) *
      SLOT_HEIGHT;
  }

  const colTemplate =
    view === "dia"
      ? "60px minmax(0, 1fr)"
      : `60px repeat(${dias.length}, minmax(120px, 1fr))`;

  return (
    <div className="min-w-fit">
      {/* Header dos dias */}
      <div
        className="sticky top-0 z-20 grid border-b border-gray-200 bg-white"
        style={{ gridTemplateColumns: colTemplate }}
      >
        <div className="border-r border-gray-200" />
        {dias.map((d) => {
          const ehHoje = diasIguais(d, hoje);
          return (
            <div
              key={d.toISOString()}
              className={`border-r border-gray-200 px-2 py-2 text-center text-xs font-semibold ${
                ehHoje ? "text-[#B85A24]" : "text-gray-600"
              }`}
            >
              {labelDia(d)}
            </div>
          );
        })}
      </div>

      {/* Corpo */}
      <div className="grid" style={{ gridTemplateColumns: colTemplate }}>
        {/* Coluna de horas */}
        <div className="relative border-r border-gray-200" style={{ height: altura }}>
          {slots.map((s, i) => (
            <div
              key={s}
              className="absolute left-0 right-0 border-b border-gray-100 px-1 text-[10px] text-gray-400"
              style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            >
              {s.endsWith(":00") ? s : ""}
            </div>
          ))}
        </div>

        {dias.map((d) => {
          const ehHoje = diasIguais(d, hoje);
          const isoData = toIsoDate(d);
          const ags = agendamentos.filter((a) => a.data === isoData);
          return (
            <div
              key={d.toISOString()}
              className={`relative border-r border-gray-200 ${ehHoje ? "border-l-2 border-l-blue-400" : ""}`}
              style={{ height: altura }}
            >
              {/* slots clicáveis */}
              {slots.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSlotClick(isoData, s)}
                  className="absolute left-0 right-0 border-b border-gray-100 hover:bg-[#FEF3E8]/40"
                  style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  aria-label={`Novo agendamento ${s}`}
                />
              ))}

              {/* Almoço */}
              {almocoAltura > 0 && (
                <div
                  className="pointer-events-none absolute left-0 right-0 flex items-center justify-center bg-gray-100/70 text-[10px] uppercase tracking-wider text-gray-400"
                  style={{ top: almocoTop, height: almocoAltura }}
                >
                  Almoço
                </div>
              )}

              {/* Blocos */}
              {ags.map((a) => {
                const { top, altura: h } = blocoPosicao(
                  a.hora_inicio.slice(0, 5),
                  a.hora_fim.slice(0, 5),
                );
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onBlocoClick(a)}
                    className={`absolute left-1 right-1 overflow-hidden rounded border-l-4 px-1.5 py-1 text-left text-[11px] shadow-sm hover:shadow ${STATUS_STYLES[a.status]}`}
                    style={{ top: top + 1, height: h - 2 }}
                  >
                    <p className="font-bold">{a.hora_inicio.slice(0, 5)}</p>
                    <p className="truncate">{a.paciente?.nome ?? "—"}</p>
                    {view === "dia" && (
                      <p className="truncate text-[10px] opacity-80">
                        {a.servico?.nome} • {STATUS_LABEL[a.status]}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// silence unused import warnings
void parseIsoDate;