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
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Palette,
  Briefcase,
  Stethoscope,
  Globe,
  MessageSquare,
  Newspaper,
  MessageCircle,
  Bot,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGestaoTheme } from "@/components/gestao/ThemeProvider";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import { fetchTema } from "@/lib/cms";

const FALLBACK_LOGO = logoAsset.url;

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
type SoonItem = { label: string; icon: typeof LayoutDashboard; badge: "em breve" };

const CLINICA: NavItem[] = [
  { to: "/gestao/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gestao/agenda", label: "Agenda", icon: Calendar },
  { to: "/gestao/pacientes", label: "Pacientes", icon: Users },
  { to: "/gestao/profissionais", label: "Profissionais", icon: UserCog },
  { to: "/gestao/servicos", label: "Serviços", icon: Briefcase },
  { to: "/gestao/contratos", label: "Contratos", icon: FileText },
  { to: "/gestao/financeiro", label: "Financeiro", icon: DollarSign },
];

const MEU_SITE: NavItem[] = [
  { to: "/gestao/site", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/gestao/site/paginas", label: "Páginas", icon: FileText },
  { to: "/gestao/site/layout", label: "Layout", icon: Palette },
  { to: "/gestao/site/equipe", label: "Equipe", icon: UserCog },
  { to: "/gestao/site/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
  { to: "/gestao/site/servicos", label: "Serviços do site", icon: Sparkles },
];

const MEU_SITE_SOON: SoonItem[] = [
  { label: "Blog", icon: Newspaper, badge: "em breve" },
];

const MENSAGENS_SOON: SoonItem[] = [
  { label: "WhatsApp", icon: MessageCircle, badge: "em breve" },
  { label: "Automações", icon: Bot, badge: "em breve" },
];

const MENSAGENS: NavItem[] = [
  // TODO: avaliar se o antigo "Contatos" (site) é leads de formulário. Se sim, manter aqui.
  { to: "/gestao/site/contatos", label: "Leads", icon: Inbox },
];

const TITLE_MAP: { match: RegExp; title: string }[] = [
  { match: /^\/gestao\/dashboard/, title: "Dashboard" },
  { match: /^\/gestao\/agenda/, title: "Agenda" },
  { match: /^\/gestao\/pacientes\/novo/, title: "Novo Paciente" },
  { match: /^\/gestao\/pacientes\/[^/]+/, title: "Paciente" },
  { match: /^\/gestao\/pacientes/, title: "Pacientes" },
  { match: /^\/gestao\/profissionais/, title: "Profissionais" },
  { match: /^\/gestao\/servicos/, title: "Serviços" },
  { match: /^\/gestao\/contratos/, title: "Contratos" },
  { match: /^\/gestao\/financeiro/, title: "Financeiro" },
  { match: /^\/gestao\/configuracoes/, title: "Configurações" },
  { match: /^\/gestao\/site\/equipe/, title: "Equipe (site)" },
  { match: /^\/gestao\/site\/depoimentos/, title: "Depoimentos (site)" },
  { match: /^\/gestao\/site\/servicos/, title: "Serviços (site)" },
  { match: /^\/gestao\/site\/contatos/, title: "Leads" },
  { match: /^\/gestao\/site\/paginas/, title: "Páginas do site" },
  { match: /^\/gestao\/site\/layout\/hero/, title: "Layout · Banner" },
  { match: /^\/gestao\/site\/layout\/secoes/, title: "Layout · Seções" },
  { match: /^\/gestao\/site\/layout\/rodape/, title: "Layout · Rodapé" },
  { match: /^\/gestao\/site\/layout/, title: "Layout do site" },
  { match: /^\/gestao\/site$/, title: "Admin do site" },
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
            ? "bg-[#FEF3E8] text-[#B85A24] font-medium border-r-2 border-[#D67F43] dark:bg-brand/15 dark:text-brand dark:border-brand"
            : "text-gray-600 hover:bg-[#FEF3E8] hover:text-[#D67F43] dark:text-muted-foreground dark:hover:bg-brand/10 dark:hover:text-brand"
        }`}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  const renderSoon = (item: SoonItem) => {
    const Icon = item.icon;
    return (
      <div
        key={item.label}
        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-400 dark:text-muted-foreground cursor-not-allowed"
        aria-label={`${item.label} (em breve)`}
        title="Em breve"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {item.label}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded dark:bg-muted dark:text-muted-foreground">
          em breve
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="mb-3 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-foreground">
        <Stethoscope className="h-3.5 w-3.5" />
        Clínica
      </div>
      <nav className="space-y-1 mb-5">{CLINICA.map(renderItem)}</nav>

      <div className="mb-3 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        Meu site
      </div>
      <nav className="space-y-1 mb-5">
        {MEU_SITE.map(renderItem)}
        {MEU_SITE_SOON.map(renderSoon)}
      </nav>

      <div className="mb-3 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        Mensagens
      </div>
      <nav className="space-y-1 mb-5">
        {MENSAGENS.map(renderItem)}
        {MENSAGENS_SOON.map(renderSoon)}
      </nav>
    </>
  );
}

function ThemeToggle() {
  const { theme, setTheme, resolved } = useGestaoTheme();
  const Icon = resolved === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Alternar tema"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
          Tema {theme === "system" ? "(sistema)" : theme === "dark" ? "(escuro)" : "(claro)"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-44">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" /> Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarFooter({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  return (
    <div className="space-y-1 border-t border-gray-200 p-3 dark:border-border">
      <Link
        to="/gestao/configuracoes"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-foreground"
      >
        <Settings className="h-4 w-4" />
        Configurações
      </Link>
      <ThemeToggle />
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
        Ver site
      </a>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
      {user?.email && (
        <p className="px-3 pt-2 text-[11px] text-gray-400 truncate dark:text-muted-foreground">{user.email}</p>
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
  const [temaLogo, setTemaLogo] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchTema().then((t) => { if (alive) setTemaLogo(t?.logo_url ?? null); });
    return () => { alive = false; };
  }, []);
  const LOGO = temaLogo || FALLBACK_LOGO;

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex dark:border-border dark:bg-sidebar">
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4 dark:border-border">
          <img src={LOGO} alt="Estação Aprender" className="h-12" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>

      <main className="relative flex-1 overflow-x-clip">
        {/* Loading bar */}
        {isPending && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-[#D67F43]/20 md:left-64">
            <div className="h-full w-1/2 animate-loading-bar bg-[#D67F43]" />
          </div>
        )}

        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-border dark:bg-card">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col p-0 dark:bg-sidebar">
                <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4 dark:border-border">
                  <img src={LOGO} alt="Estação Aprender" className="h-12" />
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
                <SidebarFooter onSignOut={handleSignOut} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-foreground">{effectiveTitle}</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-gray-500 dark:text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </header>
        <div className="relative p-6">
          {showLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] dark:bg-background/60">
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