import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Hero } from "@/components/site/sections/Hero";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { DynamicSections } from "@/components/site/sections/dynamic/DynamicSections";
import { fetchPaginaBySlug, fetchPublicPageData } from "@/lib/cms";
import { PageJsonLd } from "@/components/site/PageJsonLd";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const pagina = await fetchPaginaBySlug("home");
      const data = await fetchPublicPageData(pagina?.id ?? null);
      return { ...data };
    } catch {
      return { secoes: [], team: [], testimonials: [], servicos: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Estação Aprender — Morumbi" },
      {
        name: "description",
        content:
          "Equipe multiprofissional especializada no cuidado integral de crianças e adolescentes.",
      },
      { property: "og:title", content: "Estação Aprender — Morumbi" },
      {
        property: "og:description",
        content:
          "Cuidando da saúde emocional de crianças, adolescentes e suas famílias com acolhimento e profissionalismo.",
      },
      {
        property: "og:image",
        content:
          "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { secoes, team, testimonials, servicos } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Header />
      <main>
        <PageJsonLd
          pageTitle="Início"
          pagePath="/"
          brand="Estação Aprender"
          secoes={secoes}
          team={team}
          testimonials={testimonials}
          servicos={servicos}
          alwaysTestimonials
        />
        <Hero />
        <DynamicSections
          paginaSlug="home"
          secoes={secoes}
          team={team}
          testimonials={testimonials}
          servicos={servicos}
        />
        <Testimonials initial={testimonials} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
