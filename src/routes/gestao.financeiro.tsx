import { createFileRoute } from "@tanstack/react-router";
import { FinanceiroPage } from "@/components/gestao/financeiro/FinanceiroPage";

export const Route = createFileRoute("/gestao/financeiro")({
  component: FinanceiroPage,
});
