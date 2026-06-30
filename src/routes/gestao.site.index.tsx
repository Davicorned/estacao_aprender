import { createFileRoute } from "@tanstack/react-router";
import { SiteDashboard } from "@/components/gestao/site/SiteDashboard";

export const Route = createFileRoute("/gestao/site/")({
  component: SiteDashboard,
});