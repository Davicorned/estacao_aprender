import { createFileRoute } from "@tanstack/react-router";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { DashboardPage } from "@/components/gestao/dashboard/DashboardPage";

export const Route = createFileRoute("/gestao/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <GestaoShell title="Dashboard">
      <DashboardPage />
    </GestaoShell>
  );
}