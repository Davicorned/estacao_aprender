import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutTabs } from "@/components/gestao/site/LayoutTabs";

export const Route = createFileRoute("/gestao/site/layout")({
  component: LayoutShell,
});

function LayoutShell() {
  return (
    <div>
      <LayoutTabs />
      <Outlet />
    </div>
  );
}