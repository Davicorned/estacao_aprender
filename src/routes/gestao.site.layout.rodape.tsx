import { createFileRoute } from "@tanstack/react-router";
import { RodapeManager } from "@/components/gestao/site/RodapeManager";

export const Route = createFileRoute("/gestao/site/layout/rodape")({
  component: RodapeManager,
});