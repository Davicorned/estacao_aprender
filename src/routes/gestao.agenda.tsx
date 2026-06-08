import { createFileRoute } from "@tanstack/react-router";
import { AgendaPage } from "@/components/gestao/agenda/AgendaPage";

export const Route = createFileRoute("/gestao/agenda")({
  component: AgendaPage,
});