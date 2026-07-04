import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { FadeUp } from "@/components/site/FadeUp";
import { fetchPostsPublicados, type BlogPost } from "@/lib/blog";

const BRAND = "Estação Aprender";

export const Route = createFileRoute("/blog")({
  loader: async () => {
    try {
      const posts = await fetchPostsPublicados();
      return { posts };
    } catch (err) {
      console.error("blog list loader error", err);
      return { posts: [] as BlogPost[] };
    }
  },
  head: () => ({
    meta: [
      { title: `Blog — ${BRAND}` },
      {
        name: "description",
        content: "Artigos, dicas e novidades da Estação Aprender sobre desenvolvimento infantil, terapias e famílias.",
      },
      { property: "og:title", content: `Blog — ${BRAND}` },
      { property: "og:description", content: "Artigos e novidades da Estação Aprender." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndexPage,
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function BlogIndexPage() {
  const { posts } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageBanner
          eyebrow="Blog"
          title="Blog"
          description="Textos e novidades da nossa equipe sobre desenvolvimento infantil, terapias, aprendizado e famílias."
        />
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <FadeUp className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
              <h2 className="text-xl font-semibold">Em breve, nossos primeiros artigos</h2>
              <p className="mt-3 text-gray-600">
                Estamos preparando conteúdos com todo o carinho. Volte em breve!
              </p>
            </FadeUp>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <FadeUp key={post.id}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    {post.capa_url ? (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--site-soft)]">
                        <img
                          src={post.capa_url}
                          alt={post.titulo}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full bg-gradient-to-br from-[var(--site-soft)] to-[var(--site-soft-2)]" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {post.categoria && (
                        <span className="mb-2 self-start rounded-full bg-[var(--site-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--site-eyebrow)]">
                          {post.categoria}
                        </span>
                      )}
                      <h2 className="text-lg font-semibold leading-tight text-gray-900 group-hover:text-[var(--site-primary)]">
                        {post.titulo}
                      </h2>
                      {post.resumo && (
                        <p className="mt-2 line-clamp-3 text-sm text-gray-600">{post.resumo}</p>
                      )}
                      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-500">
                        {post.autor && <span>{post.autor}</span>}
                        {post.autor && post.publicado_em && <span>·</span>}
                        {post.publicado_em && <time dateTime={post.publicado_em}>{formatDate(post.publicado_em)}</time>}
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}