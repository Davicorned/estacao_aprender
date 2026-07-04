import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
  fetchSiteContatos,
  pickBotaoFlutuante,
  pickHeaderTelefone,
  pickWhatsappPrimario,
  telefoneHref,
  type ContatoTelefone,
  type SiteContatos,
} from "./cms";

const EMPTY: SiteContatos = { telefones: [], emails: [], enderecos: [] };

/** Retorna os contatos do site + helpers já calculados. Usa dados do loader do root quando disponíveis. */
export function useSiteContatos() {
  const rootApi = getRouteApi("__root__");
  let initial: SiteContatos | null = null;
  try {
    const rootData = rootApi.useLoaderData();
    initial = ((rootData as any)?.initial?.contatos as SiteContatos | undefined) ?? null;
  } catch {
    /* fora do root */
  }
  const [data, setData] = useState<SiteContatos>(initial ?? EMPTY);
  useEffect(() => {
    if (initial) return;
    let alive = true;
    void fetchSiteContatos(false).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [initial]);

  const botaoFlutuante = pickBotaoFlutuante(data.telefones);
  const headerTelefone = pickHeaderTelefone(data.telefones);
  const whatsappPrimario = pickWhatsappPrimario(data.telefones);

  return {
    ...data,
    botaoFlutuante,
    headerTelefone,
    whatsappPrimario,
    whatsappPrimarioHref: whatsappPrimario ? telefoneHref(whatsappPrimario) : "#",
    hrefFor: (t: ContatoTelefone) => telefoneHref(t),
  };
}