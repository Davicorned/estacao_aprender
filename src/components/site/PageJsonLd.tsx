import { SeoJsonLd, compactJsonLd } from "./SeoJsonLd";
import type {
  SiteSecao,
  SiteServico,
  TeamMember,
  Testimonial,
} from "@/lib/cms";

type Props = {
  pageTitle: string;
  pagePath: string; // relative, e.g. "/QuemSomos" or "/"
  brand: string;
  secoes?: SiteSecao[];
  team?: TeamMember[];
  testimonials?: Testimonial[];
  servicos?: SiteServico[];
  /** Force testimonials block on Home even without a "depoimentos" section. */
  alwaysTestimonials?: boolean;
};

export function PageJsonLd({
  pageTitle,
  pagePath,
  brand,
  secoes = [],
  team = [],
  testimonials = [],
  servicos = [],
  alwaysTestimonials = false,
}: Props) {
  const blocks: Record<string, unknown>[] = [];
  const hasType = (t: string) => secoes.some((s) => s.tipo === t);

  // Breadcrumb (skip on home)
  if (pagePath && pagePath !== "/") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: "/" },
        { "@type": "ListItem", position: 2, name: pageTitle, item: pagePath },
      ],
    });
  }

  // Services
  if (hasType("servicos-cards") && servicos.length > 0) {
    servicos.forEach((s) => {
      blocks.push(
        compactJsonLd({
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.titulo,
          description: s.descricao || undefined,
          provider: { "@type": "MedicalClinic", name: brand },
        }),
      );
    });
  }

  // Team → Person, referenced as employees of the clinic
  if (hasType("equipe") && team.length > 0) {
    const employees = team.map((m) =>
      compactJsonLd({
        "@type": "Person",
        name: m.nome,
        jobTitle: m.titulo || undefined,
        description: m.bio || undefined,
      }),
    );
    blocks.push({
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      name: brand,
      employee: employees,
    });
  }

  // Reviews from testimonials (safe: reviews only, no aggregateRating)
  const showsTestimonials = alwaysTestimonials || hasType("depoimentos");
  if (showsTestimonials && testimonials.length > 0) {
    const reviews = testimonials.map((t) =>
      compactJsonLd({
        "@type": "Review",
        author: { "@type": "Person", name: t.nome },
        reviewBody: t.texto,
      }),
    );
    blocks.push({
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      name: brand,
      review: reviews,
    });
  }

  // FAQ from accordion sections whose items look like Q/A
  const faqItems: { titulo: string; descricao: string }[] = [];
  secoes
    .filter((s) => s.tipo === "accordion")
    .forEach((s) => {
      s.itens.forEach((it) => {
        if (it.titulo && it.descricao) {
          faqItems.push({ titulo: it.titulo, descricao: it.descricao });
        }
      });
    });
  if (faqItems.length > 0) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.titulo,
        acceptedAnswer: { "@type": "Answer", text: f.descricao },
      })),
    });
  }

  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((b, i) => (
        <SeoJsonLd key={i} data={b} />
      ))}
    </>
  );
}