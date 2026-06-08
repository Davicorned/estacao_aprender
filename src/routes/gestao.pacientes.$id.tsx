import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { Placeholder } from "@/components/gestao/Placeholder";

export const Route = createFileRoute("/gestao/pacientes/$id")({
  component: PacienteFicha,
});

function PacienteFicha() {
  const { id } = Route.useParams();
  return (
    <GestaoShell title={`Paciente ${id}`}>
      <Placeholder message="Ficha do paciente — disponível após Fase 2." />
    </GestaoShell>
  );
}