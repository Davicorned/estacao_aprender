import type { DocumentoEstilo, HeaderEstilo } from "@/lib/documento-estilo";
import type { ClinicaConfig } from "@/lib/configuracoes";

export const PAGE_W = 794;
export const PAGE_H = 1123;

export type RenderCtx = {
  logoSrc?: string | null;
  clinica?: Pick<ClinicaConfig, "nome" | "telefone" | "endereco"> | null;
};

export type FooterCtx = RenderCtx & { pageNum: number; total: number };

export type ContentMetrics = { top: number; left: number; right: number; bottom: number };

function bg(cfg: DocumentoEstilo): string {
  return cfg.header_cor_2
    ? `linear-gradient(135deg, ${cfg.header_cor}, ${cfg.header_cor_2})`
    : cfg.header_cor;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function logoImg(src: string | null | undefined, w: number, h: number, align: "left" | "center" = "left"): string {
  if (!src) return "";
  const justify = align === "center" ? "center" : "flex-start";
  return `<div style="display:flex;justify-content:${justify};align-items:center;width:100%;">
    <img src="${esc(src)}" alt="Logo" crossorigin="anonymous" style="width:${w}px;height:${h}px;object-fit:contain;display:block;"/>
  </div>`;
}

function taglineBlock(cfg: DocumentoEstilo, color: string, align: "left" | "right" | "center" = "right"): string {
  if (!cfg.mostrar_tagline || !cfg.tagline) return "";
  const linhas = cfg.tagline.split(/·|\|/g).map((s) => s.trim()).filter(Boolean);
  const html = linhas
    .reduce<string[]>((acc, cur, i) => {
      const idx = Math.floor(i / 2);
      acc[idx] = acc[idx] ? `${acc[idx]} · ${esc(cur)}` : esc(cur);
      return acc;
    }, [])
    .join("<br/>");
  return `<div style="text-align:${align};color:${color};font-size:12px;line-height:1.7;letter-spacing:0.02em;">${html}</div>`;
}

export function getContentMetrics(cfg: DocumentoEstilo): ContentMetrics {
  const style = cfg.header_estilo;
  const rodapeAlt = cfg.rodape_mostrar ? 90 : 40;
  const base: ContentMetrics = { top: 170, left: 48, right: 48, bottom: rodapeAlt };
  switch (style) {
    case "curva":
      return { ...base, top: Math.max(140, cfg.header_altura) };
    case "barra":
      return { ...base, top: Math.max(120, Math.min(cfg.header_altura, 160)) };
    case "linha":
      return { ...base, top: 110 };
    case "timbrado":
      return { ...base, top: 160 };
    case "faixa-lateral":
      return { top: 60, left: 78, right: 48, bottom: rodapeAlt };
    case "canto":
      return { ...base, top: 120 };
    case "moldura":
      return { top: 72, left: 60, right: 60, bottom: cfg.rodape_mostrar ? 100 : 60 };
    case "nenhum":
      return { top: 70, left: 48, right: 48, bottom: rodapeAlt };
    default:
      return base;
  }
}

function headerCurva(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const h = Math.max(140, cfg.header_altura);
  const color = cfg.header_texto_cor;
  const align = cfg.logo_alinhamento === "centro" ? "center" : "left";
  const logoLeft = align === "center" ? `${PAGE_W / 2 - 95}px` : "42px";
  return `
    <div style="position:absolute;top:0;left:0;width:${PAGE_W}px;height:${h}px;overflow:hidden;">
      <svg viewBox="0 0 794 200" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block;">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${cfg.header_cor}"/>
            <stop offset="100%" stop-color="${cfg.header_cor_2 ?? cfg.header_cor}"/>
          </linearGradient>
        </defs>
        <path d="M0,0 L794,0 L794,140 C680,205 540,180 420,160 C300,140 180,180 80,170 C50,167 20,160 0,150 Z" fill="url(#g1)"/>
      </svg>
      <div style="position:absolute;top:20px;left:${logoLeft};width:190px;height:107px;color:${color};">
        ${logoImg(ctx.logoSrc, 190, 107, "left")}
      </div>
      ${cfg.mostrar_tagline ? `<div style="position:absolute;top:34px;right:48px;">${taglineBlock(cfg, color, "right")}</div>` : ""}
    </div>
  `;
}

function headerBarra(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const h = Math.max(110, Math.min(cfg.header_altura, 150));
  const color = cfg.header_texto_cor;
  return `
    <div style="position:absolute;top:0;left:0;width:${PAGE_W}px;height:${h}px;background:${bg(cfg)};display:flex;align-items:center;justify-content:space-between;padding:0 42px;color:${color};">
      <div style="width:170px;height:90px;">${logoImg(ctx.logoSrc, 170, 90, "left")}</div>
      ${cfg.mostrar_tagline ? taglineBlock(cfg, color, "right") : ""}
    </div>
  `;
}

function headerLinha(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const color = cfg.header_texto_cor === "#FFFFFF" ? "#1a1a1a" : cfg.header_texto_cor;
  const align = cfg.logo_alinhamento === "centro" ? "center" : "left";
  return `
    <div style="position:absolute;top:0;left:0;width:${PAGE_W}px;padding:20px 48px 0;">
      <div style="display:flex;justify-content:${align === "center" ? "center" : "space-between"};align-items:flex-end;">
        <div style="width:150px;height:70px;">${logoImg(ctx.logoSrc, 150, 70, "left")}</div>
        ${align === "left" && cfg.mostrar_tagline ? taglineBlock(cfg, color, "right") : ""}
      </div>
      <div style="height:2px;background:${bg(cfg)};margin-top:10px;border-radius:2px;"></div>
    </div>
  `;
}

function headerTimbrado(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const color = cfg.header_texto_cor === "#FFFFFF" ? "#1a1a1a" : cfg.header_texto_cor;
  const nome = ctx.clinica?.nome ?? "";
  return `
    <div style="position:absolute;top:0;left:0;width:${PAGE_W}px;padding:24px 48px 0;text-align:center;color:${color};">
      <div style="width:100%;height:80px;">${logoImg(ctx.logoSrc, 150, 80, "center")}</div>
      ${nome ? `<div style="font-size:18px;font-weight:700;letter-spacing:0.05em;margin-top:8px;color:${cfg.header_cor};">${esc(nome).toUpperCase()}</div>` : ""}
      <div style="height:1px;background:${bg(cfg)};margin:10px auto;width:60%;"></div>
      ${cfg.mostrar_tagline ? taglineBlock(cfg, color, "center") : ""}
    </div>
  `;
}

function headerFaixaLateral(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const color = cfg.header_texto_cor === "#FFFFFF" ? "#1a1a1a" : cfg.header_texto_cor;
  return `
    <div style="position:absolute;top:0;left:0;width:40px;height:${PAGE_H}px;background:${bg(cfg)};"></div>
    <div style="position:absolute;top:20px;left:70px;right:48px;display:flex;justify-content:space-between;align-items:center;color:${color};">
      <div style="width:140px;height:60px;">${logoImg(ctx.logoSrc, 140, 60, "left")}</div>
      ${cfg.mostrar_tagline ? taglineBlock(cfg, color, "right") : ""}
    </div>
  `;
}

function headerCanto(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const color = cfg.header_texto_cor;
  return `
    <div style="position:absolute;top:0;left:0;width:${PAGE_W}px;height:180px;overflow:hidden;">
      <svg viewBox="0 0 794 200" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${cfg.header_cor}"/>
            <stop offset="100%" stop-color="${cfg.header_cor_2 ?? cfg.header_cor}"/>
          </linearGradient>
        </defs>
        <polygon points="0,0 380,0 0,200" fill="url(#g2)"/>
      </svg>
      <div style="position:absolute;top:22px;left:32px;width:180px;height:80px;color:${color};">
        ${logoImg(ctx.logoSrc, 180, 80, "left")}
      </div>
      ${cfg.mostrar_tagline ? `<div style="position:absolute;top:30px;right:48px;">${taglineBlock(cfg, cfg.header_texto_cor === "#FFFFFF" ? "#1a1a1a" : color, "right")}</div>` : ""}
    </div>
  `;
}

function headerMoldura(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  const color = cfg.header_texto_cor === "#FFFFFF" ? "#1a1a1a" : cfg.header_texto_cor;
  return `
    <div style="position:absolute;top:24px;left:24px;right:24px;bottom:24px;border:1.5px solid ${cfg.header_cor};pointer-events:none;"></div>
    <div style="position:absolute;top:32px;left:24px;right:24px;text-align:center;color:${color};">
      <div style="width:100%;height:56px;">${logoImg(ctx.logoSrc, 120, 56, "center")}</div>
      ${cfg.mostrar_tagline ? `<div style="margin-top:4px;">${taglineBlock(cfg, color, "center")}</div>` : ""}
    </div>
  `;
}

function headerNenhum(cfg: DocumentoEstilo, ctx: RenderCtx): string {
  if (!ctx.logoSrc) return "";
  const align = cfg.logo_alinhamento === "centro" ? "center" : "left";
  const left = align === "center" ? `${PAGE_W / 2 - 60}px` : "48px";
  return `
    <div style="position:absolute;top:24px;left:${left};width:120px;height:40px;">
      ${logoImg(ctx.logoSrc, 120, 40, "left")}
    </div>
  `;
}

export function buildHeaderHtml(cfg: DocumentoEstilo, ctx: RenderCtx = {}): string {
  switch (cfg.header_estilo as HeaderEstilo) {
    case "curva": return headerCurva(cfg, ctx);
    case "barra": return headerBarra(cfg, ctx);
    case "linha": return headerLinha(cfg, ctx);
    case "timbrado": return headerTimbrado(cfg, ctx);
    case "faixa-lateral": return headerFaixaLateral(cfg, ctx);
    case "canto": return headerCanto(cfg, ctx);
    case "moldura": return headerMoldura(cfg, ctx);
    case "nenhum": return headerNenhum(cfg, ctx);
    default: return headerCurva(cfg, ctx);
  }
}

export function buildFooterHtml(cfg: DocumentoEstilo, ctx: FooterCtx): string {
  if (!cfg.rodape_mostrar) return "";
  const cor = cfg.rodape_cor || cfg.header_cor;
  const usar = cfg.rodape_usar_clinica;
  const tel = (usar ? ctx.clinica?.telefone : cfg.rodape_telefone) ?? "";
  const ig = (usar ? null : cfg.rodape_instagram) ?? cfg.rodape_instagram ?? "";
  const end = (usar ? ctx.clinica?.endereco : cfg.rodape_endereco) ?? "";

  const style = cfg.header_estilo;
  const leftPad = style === "faixa-lateral" ? 78 : style === "moldura" ? 60 : 48;
  const rightPad = style === "moldura" ? 60 : 48;
  const bottomPos = style === "moldura" ? 44 : 32;

  const icon = (path: string) =>
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

  const parts: string[] = [];
  if (tel) parts.push(`<span style="display:inline-flex;align-items:center;gap:6px;">${icon('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/>')}${esc(tel)}</span>`);
  if (ig) parts.push(`<span style="display:inline-flex;align-items:center;gap:6px;">${icon('<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>')}${esc(ig)}</span>`);
  if (end) parts.push(`<span style="display:inline-flex;align-items:center;gap:6px;">${icon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>')}${esc(end)}</span>`);

  const pag = cfg.mostrar_paginacao
    ? `<span style="color:#999;">${ctx.pageNum} / ${ctx.total}</span>`
    : "";

  return `
    <div style="position:absolute;left:${leftPad}px;right:${rightPad}px;bottom:${bottomPos}px;">
      <div style="height:2px;background:${cor};margin-bottom:12px;border-radius:2px;"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#666;gap:12px;">
        <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;">${parts.join("")}</div>
        ${pag}
      </div>
    </div>
  `;
}