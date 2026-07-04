import { createFileRoute } from "@tanstack/react-router";
import { ContatosManager } from "@/components/gestao/site/ContatosManager";

export const Route = createFileRoute("/gestao/site/contatos")({
  component: ContatosManager,
});