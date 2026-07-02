import { useEffect, useState } from "react";
import {
  fetchPaginaBySlug,
  fetchSecoes,
  type SiteSecao,
  type TeamMember,
  type Testimonial,
  type SiteServico,
} from "@/lib/cms";
import { DynamicSection } from "./DynamicSection";

type Props = {
  /** Filter sections by page id. */
  paginaId?: string | null;
  /** Convenience: resolve a page by slug then filter by its id. */
  paginaSlug?: string;
  /** SSR-provided sections (skips client fetch). */
  secoes?: SiteSecao[];
  /** SSR-provided collections (passed down to templates). */
  team?: TeamMember[];
  testimonials?: Testimonial[];
  servicos?: SiteServico[];
};

export function DynamicSections({
  paginaId,
  paginaSlug,
  secoes: secoesProp,
  team,
  testimonials,
  servicos,
}: Props = {}) {
  const hasSSR = secoesProp !== undefined;
  const [secoes, setSecoes] = useState<SiteSecao[]>(secoesProp ?? []);

  useEffect(() => {
    if (hasSSR) {
      setSecoes(secoesProp ?? []);
      return;
    }
    let cancelled = false;
    (async () => {
      let id: string | null | undefined = paginaId;
      if (!id && paginaSlug) {
        const p = await fetchPaginaBySlug(paginaSlug);
        id = p?.id ?? null;
      }
      const data = await fetchSecoes(false, id ?? undefined);
      if (!cancelled) setSecoes(data);
    })();
    return () => { cancelled = true; };
  }, [paginaId, paginaSlug, hasSSR, secoesProp]);

  if (secoes.length === 0) return null;
  return (
    <>
      {secoes.map((s) => (
        <DynamicSection
          key={s.id}
          secao={s}
          team={team}
          testimonials={testimonials}
          servicos={servicos}
        />
      ))}
    </>
  );
}