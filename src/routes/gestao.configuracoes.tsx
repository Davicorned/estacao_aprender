import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { ServicosSection } from "@/components/gestao/config/ServicosSection";
import { ProfissionaisSection } from "@/components/gestao/config/ProfissionaisSection";
import { ClinicaSection } from "@/components/gestao/config/ClinicaSection";

export const Route = createFileRoute("/gestao/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <GestaoShell title="Configurações">
      <div className="space-y-6">
        <ServicosSection />
        <ProfissionaisSection />
        <ClinicaSection />
      </div>
    </GestaoShell>
  );
}