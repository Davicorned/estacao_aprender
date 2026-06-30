import { createFileRoute } from "@tanstack/react-router";
import { PaginasManager } from "@/components/gestao/site/PaginasManager";

export const Route = createFileRoute("/gestao/site/paginas")({
  component: PaginasManager,
});