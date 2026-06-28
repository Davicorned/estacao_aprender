import { createFileRoute } from "@tanstack/react-router";
import { DepoimentosManager } from "@/components/gestao/DepoimentosManager";

export const Route = createFileRoute("/gestao/site/depoimentos")({
  component: DepoimentosManager,
});
