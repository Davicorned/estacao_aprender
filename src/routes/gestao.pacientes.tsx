import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/gestao/pacientes")({
  component: () => <Outlet />,
});