import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { CTABanner } from "@/components/site/CTABanner";
import { OurStory } from "@/components/site/sections/quemsomos/OurStory";
import { OurValues } from "@/components/site/sections/quemsomos/OurValues";
import { Founder } from "@/components/site/sections/quemsomos/Founder";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";
import { fetchPaginaBySlug, fetchSecoes, type SitePagina, type SiteSecao } from "@/lib/cms";

const SLUG = "quem-somos";
const FALLBACK = {
  eyebrow: "Sobre nós",
  title: "Cuidamos de cada fase do desenvolvimento do seu filho",
  description:
    "Com um olhar integrado, entendemos as necessidades do seu filho e direcionamos caminhos para o seu desenvolvimento.",
};

export const Route = createFileRoute("/QuemSomos")({
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
      { title: "Quem Somos — Estação Aprender" },
      { name: "description", content: "Conheça a história, os valores e a equipe do Estação Aprender." },
      { property: "og:title", content: "Quem Somos — Estação Aprender" },
      { property: "og:description", content: "Cuidamos de cada fase do desenvolvimento do seu filho com uma equipe multidisciplinar." },
    ],
    links: [{ rel: "canonical", href: "/QuemSomos" }],
  }),
  component: QuemSomosPage,
});

function QuemSomosPage() {
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
            <OurStory />
            <OurValues />
            <Founder />
            <CTABanner
              title="Vamos cuidar da sua família juntos?"
              description="Estamos prontos para ajudar você e seu filho a superar desafios e construir uma vida mais feliz e saudável."
              buttonLabel="Fale conosco"
              href="https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20mais%20sobre%20o%20Esta%C3%A7%C3%A3o%20Aprender."
            />
          </>
        )}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}