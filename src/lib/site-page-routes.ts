/**
 * Mapping entre slugs do CMS e as rotas canônicas (PascalCase) das
 * páginas legadas. Mantém /QuemSomos, /Servicos, /Atendimento e /Contato
 * como URLs oficiais (SEO + links existentes), enquanto o admin edita
 * o conteúdo pelas linhas correspondentes em site_paginas.
 */
export const LEGACY_SLUG_TO_ROUTE: Record<string, string> = {
  "quem-somos": "/QuemSomos",
  servicos: "/Servicos",
  atendimento: "/Atendimento",
  contato: "/Contato",
};

export function pageCanonicalUrl(slug: string, isHome = false): string {
  if (isHome) return "/";
  return LEGACY_SLUG_TO_ROUTE[slug] ?? `/${slug}`;
}