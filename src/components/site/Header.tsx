import { useEffect, useState } from "react";
import { Calendar, Menu, Mail, Phone, Instagram, Facebook } from "lucide-react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import { fetchHeader, fetchRodape, HEADER_DEFAULTS, type SiteHeader, type SiteRodape } from "@/lib/cms";

const FALLBACK_LOGO = logoAsset.url;

function bgStyle(h: { bg_cor: string | null; bg_cor_2: string | null }) {
  if (h.bg_cor && h.bg_cor_2) {
    return { backgroundImage: `linear-gradient(90deg, ${h.bg_cor}, ${h.bg_cor_2})` };
  }
  if (h.bg_cor) return { backgroundColor: h.bg_cor };
  return undefined;
}

export type HeaderLayout =
  | "logo-esquerda"
  | "logo-centralizado"
  | "transparente"
  | "com-barra-superior"
  | "minimalista";

export function Header({ override }: { override?: Partial<SiteHeader> } = {}) {
  const [open, setOpen] = useState(false);
  const rootApi = getRouteApi("__root__");
  let initialFromLoader: SiteHeader | null = null;
  try {
    const rootData = rootApi.useLoaderData();
    initialFromLoader = ((rootData as any)?.initial?.header as SiteHeader | undefined) ?? null;
  } catch { /* not inside root */ }
  const [data, setData] = useState<SiteHeader | null>(initialFromLoader);
  const [rodape, setRodape] = useState<SiteRodape | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (override) return;
    if (initialFromLoader) return;
    let alive = true;
    void fetchHeader().then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [override, initialFromLoader]);

  const cfg: SiteHeader = override
    ? ({ id: "singleton", ...HEADER_DEFAULTS, ...(data ?? {}), ...override } as SiteHeader)
    : ({ id: "singleton", ...HEADER_DEFAULTS, ...(data ?? {}) } as SiteHeader);

  const layout: HeaderLayout = ((cfg.layout as HeaderLayout) || "logo-esquerda");

  // Barra superior precisa dos dados do rodapé.
  useEffect(() => {
    if (layout !== "com-barra-superior") return;
    let alive = true;
    void fetchRodape().then((r) => { if (alive) setRodape(r); });
    return () => { alive = false; };
  }, [layout]);

  // Cabeçalho transparente vira sólido ao rolar.
  useEffect(() => {
    if (layout !== "transparente") return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [layout]);

  const items = (cfg.itens?.length ? cfg.itens : HEADER_DEFAULTS.itens)
    .filter((i) => i.visivel)
    .slice()
    .sort((a, b) => a.order - b.order);
  // Em "transparente" antes do scroll, força texto claro (fica sobre o banner).
  const forceLight = layout === "transparente" && !scrolled;
  const isDark = forceLight ? true : cfg.texto_cor === "claro";
  const textBase = isDark ? "text-white/85" : "text-gray-600";
  const textName = isDark ? "text-white" : "text-gray-900";
  const borderCls = isDark ? "border-white/10" : "border-gray-100";
  // Posicionamento por layout.
  const positionCls =
    layout === "transparente"
      ? "absolute top-0 left-0 right-0 z-40"
      : cfg.sticky
      ? "sticky top-0 z-40"
      : "";
  const bg = bgStyle(cfg);
  const isTranspTop = layout === "transparente" && !scrolled;
  const accent = cfg.cor_destaque || "var(--site-primary)";
  const textColor = forceLight ? null : cfg.texto_cor_hex || null;
  const logoSrc = cfg.logo_url || FALLBACK_LOGO;
  const ctaTo = cfg.cta_to || "/Contato";
  const showCta = cfg.cta_visivel && cfg.cta_label && layout !== "minimalista";

  // Estilos de fundo por layout
  const headerBgClass = isTranspTop
    ? "bg-transparent"
    : bg
    ? ""
    : "bg-white/95 backdrop-blur";
  const headerStyle = {
    ...(isTranspTop ? {} : bg ?? {}),
    ...(textColor ? { color: textColor } : {}),
  } as React.CSSProperties;

  const renderLogo = (
    <Link to="/" className="flex items-center gap-3">
      <img src={logoSrc} alt={cfg.nome_marca ?? "Logo"} className="h-12 w-auto" />
      {cfg.mostrar_nome && cfg.nome_marca && (
        <span
          className={`hidden font-semibold sm:inline ${textColor ? "" : textName}`}
          style={textColor ? { color: textColor } : undefined}
        >
          {cfg.nome_marca}
        </span>
      )}
    </Link>
  );

  const renderNav = (extraClass = "") => (
    <nav className={`hidden items-center gap-8 lg:flex ${extraClass}`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.to}
          className={`text-sm font-medium ${textColor ? "" : textBase} transition-colors`}
          style={textColor ? { color: textColor } : undefined}
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = textColor || "")}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );

  const renderCta = showCta ? (
    <a
      href={ctaTo}
      className="hidden h-9 items-center gap-2 rounded-full px-6 text-sm font-medium text-white shadow-lg transition-all sm:inline-flex"
      style={{ backgroundColor: accent, boxShadow: `0 10px 15px -3px color-mix(in srgb, ${accent} 25%, transparent)` }}
    >
      <Calendar className="h-4 w-4" />
      {cfg.cta_label}
    </a>
  ) : null;

  const renderMobileTrigger = (
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
              className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-[var(--site-soft)]"
            >
              {item.label}
            </a>
          ))}
          {showCta && (
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
  );

  // Barra superior (contato + redes) — apenas layout "com-barra-superior"
  const topBar = layout === "com-barra-superior" ? (
    <div
      className="border-b text-xs"
      style={{
        backgroundColor: accent,
        color: "#fff",
        borderColor: "rgba(255,255,255,0.15)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {rodape?.telefone && (
            <a href={rodape.telefone_link || `tel:${rodape.telefone}`} className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{rodape.telefone}</span>
            </a>
          )}
          {rodape?.email && (
            <a href={`mailto:${rodape.email}`} className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{rodape.email}</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          {(rodape?.redes_sociais ?? []).map((r, i) => {
            const Icon = r.tipo === "facebook" ? Facebook : Instagram;
            return (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" className="opacity-90 hover:opacity-100" aria-label={r.tipo}>
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  // Corpo principal do cabeçalho por layout.
  let body: JSX.Element;
  if (layout === "logo-centralizado") {
    body = (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pt-4 lg:justify-center">
          {renderLogo}
          <div className="lg:hidden">{renderMobileTrigger}</div>
        </div>
        <div className="hidden items-center justify-between gap-6 pb-3 pt-3 lg:flex">
          <div className="flex-1" />
          {renderNav()}
          <div className="flex flex-1 justify-end">{renderCta}</div>
        </div>
      </div>
    );
  } else if (layout === "minimalista") {
    body = (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {renderLogo}
          {renderNav()}
          {renderMobileTrigger}
        </div>
      </div>
    );
  } else {
    // logo-esquerda / transparente / com-barra-superior compartilham o corpo principal
    body = (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {renderLogo}
          {renderNav()}
          <div className="flex items-center gap-2">
            {renderCta}
            {renderMobileTrigger}
          </div>
        </div>
      </div>
    );
  }

  return (
    <header
      className={`${positionCls} ${isTranspTop ? "" : "border-b"} ${borderCls} ${headerBgClass} transition-colors`}
      style={headerStyle}
    >
      {topBar}
      {body}
    </header>
  );
}