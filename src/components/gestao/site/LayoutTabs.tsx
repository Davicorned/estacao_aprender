import { Link, useLocation } from "@tanstack/react-router";
import { Image as ImageIcon, Layout as LayoutIcon, PanelBottom, PanelTop, Palette } from "lucide-react";

const TABS = [
  { to: "/gestao/site/layout/header", label: "Cabeçalho", icon: PanelTop },
  { to: "/gestao/site/layout/hero", label: "Banner", icon: ImageIcon },
  { to: "/gestao/site/layout/secoes", label: "Seções", icon: LayoutIcon },
  { to: "/gestao/site/layout/rodape", label: "Rodapé", icon: PanelBottom },
  { to: "/gestao/site/layout/tema", label: "Identidade", icon: Palette },
];

export function LayoutTabs() {
  const { pathname } = useLocation();
  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.to);
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[#FEF3E8] text-[#B85A24] font-medium dark:bg-brand/15 dark:text-brand"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}