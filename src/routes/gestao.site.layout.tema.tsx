import { createFileRoute } from "@tanstack/react-router";
import { TemaManager } from "@/components/gestao/site/TemaManager";

export const Route = createFileRoute("/gestao/site/layout/tema")({
  component: TemaManager,
});