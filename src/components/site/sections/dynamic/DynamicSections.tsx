import { useEffect, useState } from "react";
import { fetchSecoes, type SiteSecao } from "@/lib/cms";
import { DynamicSection } from "./DynamicSection";

export function DynamicSections() {
  const [secoes, setSecoes] = useState<SiteSecao[]>([]);
  useEffect(() => {
    void fetchSecoes().then(setSecoes);
  }, []);
  if (secoes.length === 0) return null;
  return (
    <>
      {secoes.map((s) => (
        <DynamicSection key={s.id} secao={s} />
      ))}
    </>
  );
}