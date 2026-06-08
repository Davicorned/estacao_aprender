import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listEvolucoes,
  listProfissionaisAtivos,
  PERIODO_LABEL,
  type EvolucaoComJoin,
  type PeriodoFiltro,
} from "@/lib/evolucoes";
import { calcularIdade, type Paciente } from "@/lib/pacientes";
import { EvolucaoCard, htmlImpressao } from "./EvolucaoCard";
import { EvolucaoFormDialog } from "./EvolucaoFormDialog";

export function ProntuarioTab({ paciente }: { paciente: Paciente }) {
  const [profissionalId, setProfissionalId] = useState<string>("todos");
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("tudo");
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EvolucaoComJoin | null>(null);

  const profissionaisQ = useQuery({
    queryKey: ["profissionais-ativos"],
    queryFn: listProfissionaisAtivos,
  });

  const evolucoesQ = useQuery({
    queryKey: ["evolucoes", paciente.id, profissionalId, periodo, busca],
    queryFn: () =>
      listEvolucoes({
        pacienteId: paciente.id,
        profissionalId: profissionalId === "todos" ? null : profissionalId,
        periodo,
        busca,
      }),
  });

  const idade = calcularIdade(paciente.data_nascimento);
  const evolucoes = evolucoesQ.data ?? [];

  function imprimirTudo() {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(htmlImpressao(evolucoes, paciente.nome));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Prontuário — {paciente.nome}
          </h3>
          {idade !== null && (
            <p className="text-sm text-gray-500">{idade} anos</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={imprimirTudo}
            disabled={evolucoes.length === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir prontuário
          </Button>
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova evolução
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Profissional
          </label>
          <Select value={profissionalId} onValueChange={setProfissionalId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os profissionais</SelectItem>
              {(profissionaisQ.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Período
          </label>
          <Select
            value={periodo}
            onValueChange={(v) => setPeriodo(v as PeriodoFiltro)}
          >
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
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Buscar no texto
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Palavra-chave..."
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {evolucoesQ.isLoading && (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      {evolucoesQ.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Erro ao carregar evoluções.
        </div>
      )}

      {!evolucoesQ.isLoading && evolucoes.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Nenhuma evolução registrada
          {busca || periodo !== "tudo" || profissionalId !== "todos"
            ? " com os filtros atuais."
            : "."}
        </div>
      )}

      <div className="space-y-3">
        {evolucoes.map((e) => (
          <EvolucaoCard
            key={e.id}
            evolucao={e}
            pacienteNome={paciente.nome}
            onEdit={() => {
              setEditing(e);
              setOpen(true);
            }}
          />
        ))}
      </div>

      <EvolucaoFormDialog
        open={open}
        onOpenChange={setOpen}
        pacienteId={paciente.id}
        evolucao={editing}
      />
    </div>
  );
}