import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { PageBanner } from "@/components/site/PageBanner";
import { CTABanner } from "@/components/site/CTABanner";
import { Modalities } from "@/components/site/sections/atendimento/Modalities";
import { ProcessSteps } from "@/components/site/sections/atendimento/ProcessSteps";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";
import { fetchPaginaBySlug, fetchSecoes, type SitePagina, type SiteSecao } from "@/lib/cms";

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
      const secoes = pagina ? await fetchSecoes(false, pagina.id) : [];
      return { pagina, secoes };
    } catch {
      return { pagina: null as SitePagina | null, secoes: [] as SiteSecao[] };
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