import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { GestaoGuard } from "@/components/gestao/GestaoGuard";
import { GestaoShell } from "@/components/gestao/GestaoShell";

export const Route = createFileRoute("/gestao")({
  component: GestaoLayout,
});

function GestaoLayout() {
  const location = useLocation();
  const isPublic = location.pathname === "/gestao/login";

  return (
    <AuthProvider>
      {isPublic ? (
        <Outlet />
      ) : (
        <GestaoGuard>
          <GestaoShell>
            <Outlet />
          </GestaoShell>
        </GestaoGuard>
      )}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}