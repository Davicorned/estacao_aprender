import { createFileRoute } from "@tanstack/react-router";
import { SecoesOverview } from "@/components/gestao/site/SecoesOverview";

export const Route = createFileRoute("/gestao/site/layout/secoes")({
  component: SecoesOverview,
});