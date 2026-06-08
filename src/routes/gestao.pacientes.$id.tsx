import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { PacienteForm } from "@/components/gestao/pacientes/PacienteForm";
import { Button } from "@/components/ui/button";
import { getPaciente } from "@/lib/pacientes";

export const Route = createFileRoute("/gestao/pacientes/$id")({
  component: PacienteFichaPage,
});

function PacienteFichaPage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["paciente", id],
    queryFn: () => getPaciente(id),
  });

  return (
    <GestaoShell title={data?.nome ?? "Paciente"}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/gestao/pacientes">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {data?.nome ?? (isLoading ? "Carregando..." : "Paciente")}
          </h2>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center p-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Erro ao carregar paciente.
          </div>
        )}
        {!isLoading && !data && !error && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Paciente não encontrado.
          </div>
        )}
        {data && <PacienteForm paciente={data} />}
      </div>
    </GestaoShell>
  );
}