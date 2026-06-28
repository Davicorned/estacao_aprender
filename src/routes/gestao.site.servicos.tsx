import { createFileRoute } from "@tanstack/react-router";
import { ServicosManager } from "@/components/gestao/site/ServicosManager";

export const Route = createFileRoute("/gestao/site/servicos")({
  component: ServicosManager,
});