import { createFileRoute } from "@tanstack/react-router";
import { SecoesManager } from "@/components/gestao/site/SecoesManager";

export const Route = createFileRoute("/gestao/site/layout/secoes")({
  component: SecoesManager,
});