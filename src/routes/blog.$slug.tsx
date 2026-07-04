import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { SeoJsonLd, compactJsonLd } from "@/components/site/SeoJsonLd";
import { fetchPostBySlug } from "@/lib/blog";

const BRAND = "Estação Aprender";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const post = await fetchPostBySlug(params.slug);
      if (!post) throw notFound();
      return { post };
    } catch (err) {
      // notFound() sinaliza via throw — re-lança sem virar erro genérico.
      if (err && typeof err === "object" && "isNotFound" in err) throw err;
      console.error("blog article loader error", err);
      throw notFound();
    }
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    const path = `/blog/${params.slug}`;
    if (!post) {
      return {
        meta: [
          { title: `Artigo — ${BRAND}` },
          { name: "robots", content: "noindex" },
        ],
        links: [{ rel: "canonical", href: path }],
      };
    }
    const title = post.meta_title || `${post.titulo} — ${BRAND}`;
    const description = post.meta_description || post.resumo || `${post.titulo} — artigo da ${BRAND}.`;
    const image = post.og_image || post.capa_url || null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: path },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
              { name: "twitter:card", content: "summary_large_image" },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  component: BlogArticlePage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--site-eyebrow)]">Blog</p>
        <h1 className="mt-3 text-3xl font-bold">Artigo não encontrado</h1>
        <p className="mt-4 text-gray-600">O artigo que você procura pode ter sido removido ou não está mais publicado.</p>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-[var(--site-primary)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para o blog
        </Link>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Não foi possível carregar o artigo</h1>
        <p className="mt-3 text-sm text-gray-600">{error?.message ?? "Erro inesperado."}</p>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-[var(--site-primary)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para o blog
        </Link>
      </main>
      <Footer />
    </div>
  ),
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function BlogArticlePage() {
  const { post } = Route.useLoaderData();
  const path = `/blog/${post.slug}`;
  const safeHtml = DOMPurify.sanitize(post.conteudo || "", { USE_PROFILES: { html: true } });

  const articleLd = compactJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titulo,
    description: post.meta_description || post.resumo || undefined,
    image: post.og_image || post.capa_url || undefined,
    datePublished: post.publicado_em || undefined,
    dateModified: post.updated_at || undefined,
    author: post.autor ? { "@type": "Person", name: post.autor } : undefined,
    publisher: {
      "@type": "MedicalClinic",
      name: BRAND,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": path },
    keywords: post.tags && post.tags.length ? post.tags.join(", ") : undefined,
    articleSection: post.categoria || undefined,
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: "/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "/blog" },
      { "@type": "ListItem", position: 3, name: post.titulo, item: path },
    ],
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <SeoJsonLd data={[articleLd, breadcrumbLd]} />
      <main>
        <article>
          {post.capa_url && (
            <div className="w-full bg-[var(--site-soft)]">
              <div className="mx-auto max-w-5xl">
                <img
                  src={post.capa_url}
                  alt={post.titulo}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </div>
          )}
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--site-primary)]"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para o blog
            </Link>

            <header className="mt-6 space-y-4">
              {post.categoria && (
                <span className="inline-block rounded-full bg-[var(--site-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--site-eyebrow)]">
                  {post.categoria}
                </span>
              )}
              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                {post.titulo}
              </h1>
              {post.resumo && (
                <p className="text-lg leading-relaxed text-gray-600">{post.resumo}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {post.autor && <span>por {post.autor}</span>}
                {post.autor && post.publicado_em && <span>·</span>}
                {post.publicado_em && (
                  <time dateTime={post.publicado_em}>{formatDate(post.publicado_em)}</time>
                )}
              </div>
            </header>

            <div
              className="prose prose-lg mt-10 max-w-none prose-headings:text-gray-900 prose-a:text-[var(--site-primary)] prose-img:rounded-xl"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-200 pt-6">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-12 border-t border-gray-200 pt-8">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-[var(--site-primary)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para o blog
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}