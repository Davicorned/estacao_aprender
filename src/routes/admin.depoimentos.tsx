import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { DepoimentosManager } from "@/components/gestao/DepoimentosManager";

export const Route = createFileRoute("/admin/depoimentos")({
  component: () => (
    <AdminShell title="Depoimentos">
      <DepoimentosManager />
    </AdminShell>
  ),
});