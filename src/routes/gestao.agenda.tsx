import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { Placeholder } from "@/components/gestao/Placeholder";

export const Route = createFileRoute("/gestao/agenda")({
  component: () => (
    <GestaoShell title="Agenda">
      <Placeholder />
    </GestaoShell>
  ),
});