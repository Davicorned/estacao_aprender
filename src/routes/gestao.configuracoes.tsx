import { createFileRoute } from "@tanstack/react-router";
import { ServicosSection } from "@/components/gestao/config/ServicosSection";
import { ProfissionaisSection } from "@/components/gestao/config/ProfissionaisSection";
import { ClinicaSection } from "@/components/gestao/config/ClinicaSection";
import { DocumentoEstiloSection } from "@/components/gestao/config/DocumentoEstiloSection";

export const Route = createFileRoute("/gestao/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <div className="space-y-6">
      <ServicosSection />
      <ProfissionaisSection />
      <ClinicaSection />
      <DocumentoEstiloSection />
    </div>
  );
}
