import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";
import { fetchPaginaBySlug, fetchPublicPageData, type SitePagina } from "@/lib/cms";
import { pageCanonicalUrl, LEGACY_SLUG_TO_ROUTE } from "@/lib/site-page-routes";
import { PageJsonLd } from "@/components/site/PageJsonLd";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    // Redirect legacy CMS slugs to their canonical PascalCase route (301).
    const canonical = LEGACY_SLUG_TO_ROUTE[params.slug];
    if (canonical) {
      throw redirect({ to: canonical, statusCode: 301 });
    }
    const pagina = await fetchPaginaBySlug(params.slug);
    if (!pagina || !pagina.enabled) throw notFound();
    const data = await fetchPublicPageData(pagina.id);
    return { pagina, ...data };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.pagina as SitePagina | undefined;
    if (!p) return { meta: [] };
    const title = p.meta_title || `${p.titulo} — Estação Aprender`;
    const desc = p.meta_description || p.banner_descricao || "";
    const canonical = pageCanonicalUrl(p.slug, p.is_home);
    const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: canonical },
    ];
    if (p.og_image) meta.push({ property: "og:image", content: p.og_image });
    return {
      meta,
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: SlugPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi desativada.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--site-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Voltar para a Home
        </a>
      </div>
    </div>
  ),
});

function SlugPage() {
  const { pagina, secoes, team, testimonials, servicos } = Route.useLoaderData();
  const hasBanner =
    !!(pagina.banner_eyebrow || pagina.banner_titulo || pagina.banner_descricao);
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageJsonLd
          pageTitle={pagina.titulo}
          pagePath={pageCanonicalUrl(pagina.slug, pagina.is_home)}
          brand="Estação Aprender"
          secoes={secoes}
          team={team}
          testimonials={testimonials}
          servicos={servicos}
        />
        {hasBanner && (
          <PageBanner
            eyebrow={pagina.banner_eyebrow ?? ""}
            title={pagina.banner_titulo ?? pagina.titulo}
            description={pagina.banner_descricao ?? ""}
          />
        )}
        <DynamicSections
          paginaId={pagina.id}
          secoes={secoes}
          team={team}
          testimonials={testimonials}
          servicos={servicos}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}