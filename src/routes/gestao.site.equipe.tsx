import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { EquipeManager } from "@/components/gestao/EquipeManager";

export const Route = createFileRoute("/gestao/site/equipe")({
  component: () => (
    <GestaoShell title="Equipe (site)">
      <EquipeManager />
    </GestaoShell>
  ),
});