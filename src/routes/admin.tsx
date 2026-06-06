import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}