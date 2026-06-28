import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/gestao/dashboard/DashboardPage";

export const Route = createFileRoute("/gestao/dashboard")({
  component: DashboardPage,
});