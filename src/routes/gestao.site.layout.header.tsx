import { createFileRoute } from "@tanstack/react-router";
import { HeaderManager } from "@/components/gestao/site/HeaderManager";

export const Route = createFileRoute("/gestao/site/layout/header")({
  component: HeaderManager,
});