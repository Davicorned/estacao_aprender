import { useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, MessageSquareQuote, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/equipe", label: "Equipe", icon: Users },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/admin/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Carregando…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sem permissão</h1>
        <p className="max-w-md text-sm text-gray-600">
          Sua conta ({user.email}) está autenticada mas não tem o papel de admin. Veja{" "}
          <code className="rounded bg-gray-200 px-1 py-0.5">SUPABASE_SETUP.md</code> passo 2 para
          atribuir o papel.
        </p>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-200 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Admin</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Estação Aprender</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#FEF3E8] text-[#B85A24]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-gray-200 p-3">
          <a
            href="/Particular"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <ExternalLink className="h-4 w-4" />
            Ver site
          </a>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <p className="px-3 pt-2 text-[11px] text-gray-400">{user.email}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}