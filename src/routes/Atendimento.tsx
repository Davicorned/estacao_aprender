import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { CTABanner } from "@/components/site/CTABanner";
import { Modalities } from "@/components/site/sections/atendimento/Modalities";
import { ProcessSteps } from "@/components/site/sections/atendimento/ProcessSteps";
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

const SLUG = "atendimento";
const FALLBACK = {
  eyebrow: "Como funciona",
  title: "Atendimento",
  description: "Conheça como funciona nosso processo de atendimento e escolha a modalidade que melhor se adapta às suas necessidades.",
};

export const Route = createFileRoute("/Atendimento")({
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
      { title: "Atendimento — Estação Aprender" },
      { name: "description", content: "Atendimento presencial e online. Conheça as etapas e prazos do nosso processo." },
      { property: "og:title", content: "Atendimento — Estação Aprender" },
      { property: "og:description", content: "Escolha entre atendimento presencial ou online." },
    ],
    links: [{ rel: "canonical", href: "/Atendimento" }],
  }),
  component: AtendimentoPage,
});

function AtendimentoPage() {
  const { pagina, secoes, team, testimonials, servicos } = Route.useLoaderData();
  const useCms = !!pagina && secoes.length > 0;
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageJsonLd
          pageTitle="Atendimento"
          pagePath="/Atendimento"
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
            <Modalities />
            <ProcessSteps />
            <CTABanner
              title="Pronto para dar o primeiro passo?"
              description="Entre em contato agora e agende sua consulta."
              buttonLabel="Agendar consulta"
              href="https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender."
            />
          </>
        )}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}