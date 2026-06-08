import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { PacienteForm } from "@/components/gestao/pacientes/PacienteForm";

export const Route = createFileRoute("/gestao/pacientes/novo")({
  component: NovoPacientePage,
});

function NovoPacientePage() {
  return (
    <GestaoShell title="Novo Paciente">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Novo Paciente</h2>
        <PacienteForm />
      </div>
    </GestaoShell>
  );
}