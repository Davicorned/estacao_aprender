import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { ContratosPage } from "@/components/gestao/contratos/ContratosPage";

export const Route = createFileRoute("/gestao/contratos")({
  component: () => (
    <GestaoShell title="Contratos">
      <ContratosPage />
    </GestaoShell>
  ),
});