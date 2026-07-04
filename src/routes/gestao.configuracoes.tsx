import { createFileRoute } from "@tanstack/react-router";
import { ClinicaSection } from "@/components/gestao/config/ClinicaSection";

export const Route = createFileRoute("/gestao/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <div className="space-y-6">
      <ClinicaSection />
    </div>
  );
}
