import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { FinanceiroPage } from "@/components/gestao/financeiro/FinanceiroPage";

export const Route = createFileRoute("/gestao/financeiro")({
  component: () => (
    <GestaoShell title="Financeiro">
      <FinanceiroPage />
    </GestaoShell>
  ),
});