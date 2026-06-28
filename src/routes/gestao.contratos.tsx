import { createFileRoute } from "@tanstack/react-router";
import { ContratosPage } from "@/components/gestao/contratos/ContratosPage";

export const Route = createFileRoute("/gestao/contratos")({
  component: ContratosPage,
});
