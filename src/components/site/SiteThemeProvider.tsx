import { useEffect, useState, type ReactNode } from "react";
import { fetchTema, TEMA_DEFAULTS, type SiteTema } from "@/lib/cms";

type Tema = Omit<SiteTema, "id">;

function applyTema(t: Tema) {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  r.style.setProperty("--site-primary", t.cor_primaria);
  r.style.setProperty("--site-primary-hover", t.cor_primaria_hover);
  r.style.setProperty("--site-secondary", t.cor_secundaria ?? t.cor_primaria);
  r.style.setProperty("--site-text", t.cor_texto);
  r.style.setProperty("--site-bg", t.cor_fundo);
  r.style.setProperty("--site-eyebrow", t.cor_eyebrow ?? t.cor_primaria);
  r.style.setProperty("--site-font-title", t.fonte_titulos);
  r.style.setProperty("--site-font-body", t.fonte_corpo);
  r.style.setProperty("--site-radius", `${t.radius_px}px`);
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [, setTema] = useState<Tema>(TEMA_DEFAULTS);

  // Aplica defaults imediatamente (sem flash) e depois sincroniza com o banco.
  useEffect(() => {
    applyTema(TEMA_DEFAULTS);
    fetchTema().then((t) => {
      const merged: Tema = { ...TEMA_DEFAULTS, ...(t ?? {}) };
      setTema(merged);
      applyTema(merged);
    });
  }, []);

  return <>{children}</>;
}