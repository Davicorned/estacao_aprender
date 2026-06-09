import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Pencil, Search, UserPlus } from "lucide-react";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { PacienteAvatar } from "@/components/gestao/pacientes/PacienteAvatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  formatTelefoneDisplay,
  formatRelativoData,
  getPacientesAgendamentoStats,
  listPacientes,
  PAGE_SIZE,
  type Paciente,
} from "@/lib/pacientes";
import { fetchProfissionais, type Profissional } from "@/lib/configuracoes";

export const Route = createFileRoute("/gestao/pacientes/")({
  component: PacientesListPage,
});

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function PacientesListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [profissionalId, setProfissionalId] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<"nome" | "created_at">("nome");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounced(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, profissionalId, sortBy]);

  const { data, isLoading } = useQuery({
    queryKey: ["pacientes", { debouncedSearch, status, profissionalId, sortBy, page }],
    queryFn: () =>
      listPacientes({
        search: debouncedSearch,
        status,
        profissionalId: profissionalId === "todos" ? null : profissionalId,
        sortBy,
        page,
      }),
  });

  const { data: profissionais } = useQuery<Profissional[]>({
    queryKey: ["profissionais-ativos"],
    queryFn: () => fetchProfissionais(false),
  });

  const total = data?.count ?? 0;
  const pacientes = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const ids = useMemo(() => pacientes.map((p) => p.id), [pacientes]);
  const { data: stats } = useQuery({
    queryKey: ["pacientes-agendamento-stats", ids],
    queryFn: () => getPacientesAgendamentoStats(ids),
    enabled: ids.length > 0,
  });

  return (
    <GestaoShell title="Pacientes">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <Button
            asChild
            className="rounded-full bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            <Link to="/gestao/pacientes/novo">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Link>
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome, telefone ou CPF..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status:</span>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Profissional:</span>
              <Select value={profissionalId} onValueChange={setProfissionalId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {(profissionais ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="text-xs text-gray-500">Ordenar:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome (A-Z)</SelectItem>
                  <SelectItem value="created_at">Mais recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {isLoading ? "Carregando..." : `${total} paciente${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Última sessão</TableHead>
                <TableHead>Próx. agendamento</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pacientes.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pacientes.map((p) => (
                  <PacienteRow key={p.id} paciente={p} stats={stats?.[p.id]} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {pacientes.length === 0 && !isLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              Nenhum paciente encontrado.
            </div>
          ) : (
            pacientes.map((p) => (
              <PacienteCard key={p.id} paciente={p} stats={stats?.[p.id]} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {pageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <PaginationItem key={`e${i}`}>
                    <span className="px-2 text-sm text-gray-400">…</span>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p as number);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </GestaoShell>
  );
}

function PacienteRow({ paciente }: { paciente: Paciente }) {
  const navigate = useNavigate();
  return (
    <TableRow
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => navigate({ to: "/gestao/pacientes/$id", params: { id: paciente.id } })}
    >
      <TableCell>
        <PacienteAvatar nome={paciente.nome} fotoUrl={paciente.foto_url} />
      </TableCell>
      <TableCell className="font-medium text-gray-900">{paciente.nome}</TableCell>
      <TableCell className="text-gray-600">{formatTelefoneDisplay(paciente.telefone_celular)}</TableCell>
      <TableCell className="text-gray-500">—</TableCell>
      <TableCell className="text-gray-500">—</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            asChild
            size="icon"
            variant="ghost"
            title="Editar"
          >
            <Link to="/gestao/pacientes/$id" params={{ id: paciente.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="icon"
            variant="ghost"
            title="Agendar"
          >
            <Link to="/gestao/agenda">
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function PacienteCard({ paciente }: { paciente: Paciente }) {
  return (
    <Link
      to="/gestao/pacientes/$id"
      params={{ id: paciente.id }}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 active:bg-gray-50"
    >
      <PacienteAvatar nome={paciente.nome} fotoUrl={paciente.foto_url} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{paciente.nome}</p>
        <p className="text-sm text-gray-500">{formatTelefoneDisplay(paciente.telefone_celular)}</p>
        <p className="text-xs text-gray-400">Último agendamento: —</p>
      </div>
    </Link>
  );
}

function pageNumbers(current: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const add = (n: number | "...") => pages.push(n);
  const range = (a: number, b: number) => {
    for (let i = a; i <= b; i++) add(i);
  };
  if (total <= 7) {
    range(1, total);
    return pages;
  }
  add(1);
  if (current > 4) add("...");
  range(Math.max(2, current - 1), Math.min(total - 1, current + 1));
  if (current < total - 3) add("...");
  add(total);
  return pages;
}