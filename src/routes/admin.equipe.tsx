import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { EquipeManager } from "@/components/gestao/EquipeManager";

export const Route = createFileRoute("/admin/equipe")({
  component: () => (
    <AdminShell title="Equipe">
      <EquipeManager />
    </AdminShell>
  ),
});