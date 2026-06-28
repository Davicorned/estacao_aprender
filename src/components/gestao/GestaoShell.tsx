import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  DollarSign,
  UserCog,
  MessageSquareQuote,
  ExternalLink,
  LogOut,
  Menu,
  Settings,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";

const LOGO = logoAsset.url;

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const MAIN: NavItem[] = [
  { to: "/gestao/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gestao/agenda", label: "Agenda", icon: Calendar },
  { to: "/gestao/pacientes", label: "Pacientes", icon: Users },
  { to: "/gestao/contratos", label: "Contratos", icon: FileText },
  { to: "/gestao/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/gestao/configuracoes", label: "Configurações", icon: Settings },
];

const SITE: NavItem[] = [
  { to: "/gestao/site/equipe", label: "Equipe", icon: UserCog },
  { to: "/gestao/site/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
];

const TITLE_MAP: { match: RegExp; title: string }[] = [
  { match: /^\/gestao\/dashboard/, title: "Dashboard" },
  { match: /^\/gestao\/agenda/, title: "Agenda" },
  { match: /^\/gestao\/pacientes\/novo/, title: "Novo Paciente" },
  { match: /^\/gestao\/pacientes\/[^/]+/, title: "Paciente" },
  { match: /^\/gestao\/pacientes/, title: "Pacientes" },
  { match: /^\/gestao\/contratos/, title: "Contratos" },
  { match: /^\/gestao\/financeiro/, title: "Financeiro" },
  { match: /^\/gestao\/configuracoes/, title: "Configurações" },
  { match: /^\/gestao\/site\/equipe/, title: "Equipe (site)" },
  { match: /^\/gestao\/site\/depoimentos/, title: "Depoimentos (site)" },
];

function deriveTitle(pathname: string): string {
  return TITLE_MAP.find((t) => t.match.test(pathname))?.title ?? "Gestão";
}

const GestaoTitleContext = createContext<{
  setTitle: (t: string | null) => void;
} | null>(null);

export function useGestaoTitle(title: string | null | undefined) {
  const ctx = useContext(GestaoTitleContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setTitle(title ?? null);
    return () => ctx.setTitle(null);
  }, [ctx, title]);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.to, item.exact);
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          active
            ? "bg-[#FEF3E8] text-[#B85A24] font-medium border-r-2 border-[#D67F43]"
            : "text-gray-600 hover:bg-[#FEF3E8] hover:text-[#D67F43]"
        }`}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <nav className="space-y-1">{MAIN.map(renderItem)}</nav>
      <div className="my-4 border-t border-gray-200" />
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Admin do site
      </p>
      <nav className="space-y-1">{SITE.map(renderItem)}</nav>
    </>
  );
}

function SidebarFooter({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  return (
    <div className="space-y-1 border-t border-gray-200 p-3">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <ExternalLink className="h-4 w-4" />
        Ver site
      </a>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
      {user?.email && (
        <p className="px-3 pt-2 text-[11px] text-gray-400 truncate">{user.email}</p>
      )}
    </div>
  );
}

export function GestaoShell({ title, children }: { title?: string; children: ReactNode }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [override, setOverride] = useState<string | null>(null);
  const ctxValue = useMemo(() => ({ setTitle: setOverride }), []);
  const effectiveTitle = title ?? override ?? deriveTitle(location.pathname);
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setShowLoading(false);
      return;
    }
    const timer = setTimeout(() => setShowLoading(true), 150);
    return () => clearTimeout(timer);
  }, [isPending]);

  async function handleSignOut() {
    await signOut();
    void navigate({ to: "/gestao/login" });
  }

  return (
    <GestaoTitleContext.Provider value={ctxValue}>
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          <img src={LOGO} alt="Estação Aprender" className="h-10" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>

      <main className="relative flex-1 overflow-x-hidden">
        {/* Loading bar */}
        {isPending && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-[#D67F43]/20 md:left-64">
            <div className="h-full w-1/2 animate-loading-bar bg-[#D67F43]" />
          </div>
        )}

        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col p-0">
                <div className="flex h-16 items-center border-b border-gray-200 px-4">
                  <img src={LOGO} alt="Estação Aprender" className="h-10" />
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
                <SidebarFooter onSignOut={handleSignOut} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold text-gray-900">{effectiveTitle}</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </header>
        <div className="relative p-6">
          {showLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#D67F43]" />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
    </GestaoTitleContext.Provider>
  );
}