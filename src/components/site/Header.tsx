import { useEffect, useState } from "react";
import { Calendar, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import { fetchHeader, HEADER_DEFAULTS, type SiteHeader } from "@/lib/cms";

const FALLBACK_LOGO = logoAsset.url;

function bgStyle(h: { bg_cor: string | null; bg_cor_2: string | null }) {
  if (h.bg_cor && h.bg_cor_2) {
    return { backgroundImage: `linear-gradient(90deg, ${h.bg_cor}, ${h.bg_cor_2})` };
  }
  if (h.bg_cor) return { backgroundColor: h.bg_cor };
  return undefined;
}

export function Header({ override }: { override?: Partial<SiteHeader> } = {}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SiteHeader | null>(null);

  useEffect(() => {
    if (override) return;
    let alive = true;
    void fetchHeader().then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [override]);

  const cfg: SiteHeader = override
    ? ({ id: "singleton", ...HEADER_DEFAULTS, ...(data ?? {}), ...override } as SiteHeader)
    : ({ id: "singleton", ...HEADER_DEFAULTS, ...(data ?? {}) } as SiteHeader);

  const items = (cfg.itens?.length ? cfg.itens : HEADER_DEFAULTS.itens)
    .filter((i) => i.visivel)
    .slice()
    .sort((a, b) => a.order - b.order);
  const isDark = cfg.texto_cor === "claro";
  const textBase = isDark ? "text-white/85" : "text-gray-600";
  const textName = isDark ? "text-white" : "text-gray-900";
  const borderCls = isDark ? "border-white/10" : "border-gray-100";
  const stickyCls = cfg.sticky ? "sticky top-0 z-40" : "";
  const bg = bgStyle(cfg);
  const accent = cfg.cor_destaque || "#D67F43";
  const logoSrc = cfg.logo_url || FALLBACK_LOGO;
  const ctaTo = cfg.cta_to || "/Contato";

  return (
    <header
      className={`${stickyCls} border-b ${borderCls} ${bg ? "" : "bg-white/95 backdrop-blur"}`}
      style={bg}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSrc} alt={cfg.nome_marca ?? "Logo"} className="h-12 w-auto" />
            {cfg.mostrar_nome && cfg.nome_marca && (
              <span className={`hidden font-semibold sm:inline ${textName}`}>
                {cfg.nome_marca}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.to}
                className={`text-sm font-medium ${textBase} transition-colors`}
                onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {cfg.cta_visivel && cfg.cta_label && (
              <a
                href={ctaTo}
                className="hidden h-9 items-center gap-2 rounded-full px-6 text-sm font-medium text-white shadow-lg transition-all sm:inline-flex"
                style={{ backgroundColor: accent, boxShadow: `0 10px 15px -3px ${accent}40` }}
              >
                <Calendar className="h-4 w-4" />
                {cfg.cta_label}
              </a>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden ${isDark ? "text-white" : "text-gray-700"}`}
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="text-left">Menu</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1">
                  {items.map((item) => (
                    <a
                      key={item.id}
                      href={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#FEF3E8]"
                    >
                      {item.label}
                    </a>
                  ))}
                  {cfg.cta_visivel && cfg.cta_label && (
                    <a
                      href={ctaTo}
                      onClick={() => setOpen(false)}
                      className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-white shadow-lg"
                      style={{ backgroundColor: accent }}
                    >
                      <Calendar className="h-4 w-4" />
                      {cfg.cta_label}
                    </a>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}