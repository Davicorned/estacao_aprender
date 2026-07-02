import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { QuickChoiceCards } from "@/components/site/sections/contato/QuickChoiceCards";
import { Contact } from "@/components/site/sections/Contact";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";
import { PageJsonLd } from "@/components/site/PageJsonLd";
import {
  fetchPaginaBySlug,
  fetchPublicPageData,
  type SitePagina,
  type SiteSecao,
  type TeamMember,
  type Testimonial,
  type SiteServico,
} from "@/lib/cms";

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
      const data = await fetchPublicPageData(pagina?.id ?? null);
      return { pagina, ...data };
    } catch {
      return {
        pagina: null as SitePagina | null,
        secoes: [] as SiteSecao[],
        team: [] as TeamMember[],
        testimonials: [] as Testimonial[],
        servicos: [] as SiteServico[],
      };
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
  const { pagina, secoes, team, testimonials, servicos } = Route.useLoaderData();
  const useCms = !!pagina && secoes.length > 0;
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageJsonLd
          pageTitle="Contato"
          pagePath="/Contato"
          brand="Estação Aprender"
          secoes={secoes}
          team={team}
          testimonials={testimonials}
          servicos={servicos}
        />
        <PageBanner
          eyebrow={pagina?.banner_eyebrow ?? FALLBACK.eyebrow}
          title={pagina?.banner_titulo ?? FALLBACK.title}
          description={pagina?.banner_descricao ?? FALLBACK.description}
        />
        {useCms ? (
          <DynamicSections
            paginaId={pagina!.id}
            secoes={secoes}
            team={team}
            testimonials={testimonials}
            servicos={servicos}
          />
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