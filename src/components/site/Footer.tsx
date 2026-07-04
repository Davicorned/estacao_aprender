import React, { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Music2, Phone, Mail, MapPin } from "lucide-react";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import {
  fetchRodape,
  fetchTema,
  RODAPE_DEFAULTS,
  telefoneHref,
  type LinkItem,
  type RedeSocial,
  type SiteRodape,
  type SiteTema,
} from "@/lib/cms";
import { useSiteContatos } from "@/lib/useSiteContatos";
import { buildBackground } from "@/components/gestao/site/ColorField";

const FALLBACK_LOGO = logoAsset.url;

const DEFAULT = RODAPE_DEFAULTS;

const REDE_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: Phone,
  tiktok: Music2,
};

export type FooterLayout =
  | "colunas"
  | "compacto"
  | "centralizado"
  | "com-mapa"
  | "duas-colunas";

type RodapeData = Omit<SiteRodape, "id">;

function mergeRodape(r: Partial<RodapeData> | null | undefined): RodapeData {
  return {
    ...DEFAULT,
    ...(r ?? {}),
    texto_institucional: r?.texto_institucional || DEFAULT.texto_institucional,
    telefone: r?.telefone || DEFAULT.telefone,
    telefone_link: r?.telefone_link || DEFAULT.telefone_link,
    email: r?.email || DEFAULT.email,
    endereco_titulo: r?.endereco_titulo || DEFAULT.endereco_titulo,
    endereco_texto: r?.endereco_texto || DEFAULT.endereco_texto,
    copyright: r?.copyright || DEFAULT.copyright,
    redes_sociais: r?.redes_sociais?.length ? r.redes_sociais : DEFAULT.redes_sociais,
    links_rapidos: r?.links_rapidos?.length ? r.links_rapidos : DEFAULT.links_rapidos,
    links_servicos: r?.links_servicos?.length ? r.links_servicos : DEFAULT.links_servicos,
  };
}

export function Footer({ override }: { override?: Partial<RodapeData> } = {}) {
  const rootApi = getRouteApi("__root__");
  let initialFromLoader: Partial<RodapeData> | null = null;
  let initialTema: SiteTema | null = null;
  try {
    const rootData = rootApi.useLoaderData();
    initialFromLoader = ((rootData as any)?.initial?.rodape as Partial<RodapeData> | undefined) ?? null;
    initialTema = ((rootData as any)?.initial?.tema as SiteTema | undefined) ?? null;
  } catch { /* not inside root */ }
  const [data, setData] = useState<RodapeData>(() =>
    mergeRodape(override ?? initialFromLoader),
  );
  const [tema, setTema] = useState<SiteTema | null>(initialTema);
  const contatos = useSiteContatos();
  const temContatos =
    contatos.telefones.length + contatos.emails.length + contatos.enderecos.length > 0;
  useEffect(() => {
    if (override) {
      setData(mergeRodape(override));
      return;
    }
    if (initialFromLoader) return;
    fetchRodape().then((r) => setData(mergeRodape(r)));
  }, [override, initialFromLoader]);
  useEffect(() => {
    if (initialTema) return;
    let alive = true;
    void fetchTema().then((t) => { if (alive) setTema(t); });
    return () => { alive = false; };
  }, [initialTema]);
  // Rodapé usa preferencialmente o logo escuro (fundo geralmente escuro), depois o padrão.
  const isLight = data.texto_cor === "escuro";
  const LOGO = (isLight ? tema?.logo_url : tema?.logo_escuro_url || tema?.logo_url) || FALLBACK_LOGO;

  const customBg = buildBackground(data.bg_cor);
  // Decide a paleta de texto. "claro" => textos claros (fundo escuro). "escuro" => textos escuros (fundo claro).
  const cls = isLight
    ? { footer: "text-gray-800", muted: "text-gray-600", strong: "text-gray-900", border: "border-gray-200", hover: "hover:text-gray-900", chip: "bg-black/5", link: "text-gray-600 hover:text-gray-900" }
    : { footer: "text-white", muted: "text-gray-400", strong: "text-gray-300", border: "border-gray-800", hover: "hover:text-white", chip: "bg-white/10", link: "text-gray-400 hover:text-white" };
  const textColor = data.texto_cor_hex || null;
  const cardBg = data.card_bg_cor || null;
  const cardText = data.card_texto_cor || null;
  const colStyle = cardBg || cardText
    ? {
        ...(cardBg ? { backgroundColor: cardBg } : {}),
        ...(cardText ? { color: cardText } : {}),
        borderRadius: cardBg ? 12 : undefined,
        padding: cardBg ? "16px" : undefined,
      }
    : undefined;

  const layout: FooterLayout = (data.layout as FooterLayout) || "colunas";

  const brandBlock = (
    <div style={colStyle}>
      <div className="flex items-center gap-3">
        <img src={LOGO} alt="Estação Aprender" className="h-10 w-auto" />
        <span className="text-lg font-semibold">Estação Aprender</span>
      </div>
      <p
        className={`mt-4 text-sm leading-relaxed ${cardText || textColor ? "opacity-90" : cls.muted}`}
        style={cardText ? { color: cardText } : textColor ? { color: textColor } : undefined}
      >
        {data.texto_institucional}
      </p>
      <div className="mt-6 flex gap-3">
        {data.redes_sociais.map((r: RedeSocial, i) => {
          const Icon = REDE_ICONS[r.tipo] ?? Instagram;
          return (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={r.tipo}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${cls.chip} transition-colors hover:bg-[var(--site-primary)] hover:text-white`}
            >
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
      </div>
    </div>
  );

  const navBlock = (
    <div style={colStyle}>
      <h4 className="text-sm font-semibold uppercase tracking-wider">Navegação</h4>
      <ul className="mt-4 space-y-3 text-sm">
        {data.links_rapidos.map((l, i) => (
          <li key={i}><a href={l.href} className={`${cls.link} transition-colors`}>{l.label}</a></li>
        ))}
      </ul>
    </div>
  );

  const servicosBlock = (
    <div style={colStyle}>
      <h4 className="text-sm font-semibold uppercase tracking-wider">Serviços</h4>
      <ul className="mt-4 space-y-3 text-sm">
        {data.links_servicos.map((l, i) => (
          <li key={i}><a href={l.href} className={`${cls.link} transition-colors`}>{l.label}</a></li>
        ))}
      </ul>
    </div>
  );

  const contatoBlock = (
    <div style={colStyle}>
      <h4 className="text-sm font-semibold uppercase tracking-wider">Contato</h4>
      <ul className={`mt-4 space-y-4 text-sm ${cls.muted}`}>
        {temContatos ? (
          <>
            {contatos.telefones.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--site-primary)]" />
                <a
                  id={t.whatsapp_enabled ? "whatsapp_start" : undefined}
                  href={telefoneHref(t)}
                  target={t.whatsapp_enabled ? "_blank" : undefined}
                  rel={t.whatsapp_enabled ? "noopener noreferrer" : undefined}
                  className={cls.hover}
                >
                  {t.rotulo ? `${t.rotulo}: ${t.telefone_exibido}` : t.telefone_exibido}
                </a>
              </li>
            ))}
            {contatos.emails.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--site-primary)]" />
                <a href={`mailto:${e.email}`} className={`break-all ${cls.hover}`}>
                  {e.email}
                </a>
              </li>
            ))}
            {contatos.enderecos.map((en) => (
              <li key={en.id} className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--site-primary)]" />
                <span>
                  {en.rotulo && <strong className={`block ${cls.strong}`}>{en.rotulo}</strong>}
                  {en.endereco_texto}
                </span>
              </li>
            ))}
          </>
        ) : (
          <>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--site-primary)]" />
              <a
                id="whatsapp_start"
                href={data.telefone_link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cls.hover}
              >
                {data.telefone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--site-primary)]" />
              <a href={`mailto:${data.email ?? ""}`} className={`break-all ${cls.hover}`}>
                {data.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--site-primary)]" />
              <span>
                <strong className={`block ${cls.strong}`}>{data.endereco_titulo}</strong>
                {data.endereco_texto}
              </span>
            </li>
          </>
        )}
      </ul>
    </div>
  );

  const copyrightBar = (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className={`flex flex-col items-center justify-between gap-4 border-t ${cls.border} pt-8 pb-8 text-sm ${cls.muted} md:flex-row mt-0`}>
        <p>{data.copyright}</p>
        <a
          href="https://www.solucoesmarketingdigital.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className={cls.hover}
        >
          Desenvolvimento: Soluções Marketing Digital
        </a>
      </div>
    </div>
  );

  // ---------- Corpo por layout ----------
  let body: React.ReactNode;

  if (layout === "compacto") {
    const allLinks: LinkItem[] = [...data.links_rapidos, ...data.links_servicos];
    body = (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-8 w-auto" />
            <span className="text-sm font-semibold">Estação Aprender</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {allLinks.map((l, i) => (
              <a key={i} href={l.href} className={`${cls.link} transition-colors`}>{l.label}</a>
            ))}
          </nav>
          <div className="flex gap-2">
            {data.redes_sociais.map((r, i) => {
              const Icon = REDE_ICONS[r.tipo] ?? Instagram;
              return (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.tipo}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${cls.chip} transition-colors hover:bg-[var(--site-primary)] hover:text-white`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
        <div className={`mt-6 border-t ${cls.border} pt-4 text-center text-xs ${cls.muted}`}>
          {data.copyright}
        </div>
      </div>
    );
  } else if (layout === "centralizado") {
    const allLinks: LinkItem[] = [...data.links_rapidos, ...data.links_servicos];
    body = (
      <>
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-12 w-auto" />
            <span className="text-lg font-semibold">Estação Aprender</span>
            <p className={`max-w-xl text-sm leading-relaxed ${textColor ? "opacity-90" : cls.muted}`}>
              {data.texto_institucional}
            </p>
          </div>
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {allLinks.map((l, i) => (
              <a key={i} href={l.href} className={`${cls.link} transition-colors`}>{l.label}</a>
            ))}
          </nav>
          <div className="mt-8 flex justify-center gap-3">
            {data.redes_sociais.map((r, i) => {
              const Icon = REDE_ICONS[r.tipo] ?? Instagram;
              return (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.tipo}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${cls.chip} transition-colors hover:bg-[var(--site-primary)] hover:text-white`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
        {copyrightBar}
      </>
    );
  } else if (layout === "com-mapa") {
    const mapSrc = data.endereco_texto
      ? `https://www.google.com/maps?q=${encodeURIComponent(data.endereco_texto)}&output=embed`
      : null;
    body = (
      <>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
              {mapSrc ? (
                <iframe
                  title="Mapa do endereço"
                  src={mapSrc}
                  loading="lazy"
                  className="h-64 w-full lg:h-full"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className={`flex h-64 items-center justify-center text-sm ${cls.muted}`}>
                  Endereço não configurado.
                </div>
              )}
            </div>
            <div className="space-y-6">
              {brandBlock}
              {contatoBlock}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {navBlock}
            {servicosBlock}
          </div>
        </div>
        {copyrightBar}
      </>
    );
  } else if (layout === "duas-colunas") {
    body = (
      <>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          {brandBlock}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-8">
              {navBlock}
              {servicosBlock}
            </div>
            {contatoBlock}
          </div>
        </div>
        {copyrightBar}
      </>
    );
  } else {
    // colunas (default)
    body = (
      <>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {brandBlock}
          {navBlock}
          {servicosBlock}
          {contatoBlock}
        </div>
        {copyrightBar}
      </>
    );
  }

  return (
    <footer
      className={`${customBg ? "" : "bg-gray-900"} ${cls.footer}`}
      style={{
        ...(customBg ? { background: customBg } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
      {body}
    </footer>
  );
}