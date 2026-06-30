import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { QuickChoiceCards } from "@/components/site/sections/contato/QuickChoiceCards";
import { Contact } from "@/components/site/sections/Contact";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";
import { fetchPaginaBySlug, fetchSecoes, type SitePagina, type SiteSecao } from "@/lib/cms";

const SLUG = "contato";
const FALLBACK = {
  eyebrow: "Fale conosco",
  title: "Contato",
  description: "Estamos prontos para ajudar você e sua família. Entre em contato e agende sua consulta.",
};

export const Route = createFileRoute("/Contato")({
  loader: async () => {
    try {
      const pagina = await fetchPaginaBySlug(SLUG);
      const secoes = pagina ? await fetchSecoes(false, pagina.id) : [];
      return { pagina, secoes };
    } catch {
      return { pagina: null as SitePagina | null, secoes: [] as SiteSecao[] };
    }
  },
  head: () => ({
    meta: [
      { title: "Contato — Estação Aprender" },
      { name: "description", content: "Fale conosco pelo WhatsApp, e-mail ou visite uma de nossas unidades em São Paulo." },
      { property: "og:title", content: "Contato — Estação Aprender" },
      { property: "og:description", content: "Estamos prontos para ajudar você e sua família. Agende sua consulta." },
    ],
    links: [{ rel: "canonical", href: "/Contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const { pagina, secoes } = Route.useLoaderData();
  const useCms = !!pagina && secoes.length > 0;
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageBanner
          eyebrow={pagina?.banner_eyebrow ?? FALLBACK.eyebrow}
          title={pagina?.banner_titulo ?? FALLBACK.title}
          description={pagina?.banner_descricao ?? FALLBACK.description}
        />
        {useCms ? (
          <DynamicSections paginaId={pagina!.id} />
        ) : (
          <>
            <QuickChoiceCards />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}