import { useEffect, useState } from "react";
import { fetchPaginaBySlug, fetchSecoes, type SiteSecao } from "@/lib/cms";
import { DynamicSection } from "./DynamicSection";

type Props = {
  /** Filter sections by page id. */
  paginaId?: string | null;
  /** Convenience: resolve a page by slug then filter by its id. */
  paginaSlug?: string;
};

export function DynamicSections({ paginaId, paginaSlug }: Props = {}) {
  const [secoes, setSecoes] = useState<SiteSecao[]>([]);
  useEffect(() => {
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
  }, [paginaId, paginaSlug]);
  if (secoes.length === 0) return null;
  return (
    <>
      {secoes.map((s) => (
        <DynamicSection key={s.id} secao={s} />
      ))}
    </>
  );
}