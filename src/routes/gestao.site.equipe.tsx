import { createFileRoute } from "@tanstack/react-router";
import { EquipeManager } from "@/components/gestao/EquipeManager";

export const Route = createFileRoute("/gestao/site/equipe")({
  component: EquipeManager,
});
