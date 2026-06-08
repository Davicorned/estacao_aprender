import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { DepoimentosManager } from "@/components/gestao/DepoimentosManager";

export const Route = createFileRoute("/gestao/site/depoimentos")({
  component: () => (
    <GestaoShell title="Depoimentos (site)">
      <DepoimentosManager />
    </GestaoShell>
  ),
});