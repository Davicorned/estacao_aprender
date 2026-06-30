import { useEffect, useState } from "react";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { fetchHero, HERO_DEFAULTS, type SiteHero } from "@/lib/cms";
import { buildBackground } from "@/components/gestao/site/ColorField";

type HeroData = Omit<SiteHero, "id">;

function mergeHero(h: Partial<HeroData> | null | undefined): HeroData {
  return {
    titulo: h?.titulo || HERO_DEFAULTS.titulo,
    titulo_destaque: h?.titulo_destaque || HERO_DEFAULTS.titulo_destaque,
    subtitulo: h?.subtitulo || HERO_DEFAULTS.subtitulo,
    cta_primario_texto: h?.cta_primario_texto || HERO_DEFAULTS.cta_primario_texto,
    cta_primario_link: h?.cta_primario_link || HERO_DEFAULTS.cta_primario_link,
    cta_secundario_texto: h?.cta_secundario_texto || HERO_DEFAULTS.cta_secundario_texto,
    cta_secundario_link: h?.cta_secundario_link || HERO_DEFAULTS.cta_secundario_link,
    imagem_url: h?.imagem_url || HERO_DEFAULTS.imagem_url,
    badge_enabled: h?.badge_enabled ?? HERO_DEFAULTS.badge_enabled,
    badge_titulo: h?.badge_titulo || HERO_DEFAULTS.badge_titulo,
    badge_subtitulo: h?.badge_subtitulo || HERO_DEFAULTS.badge_subtitulo,
    bg_cor: h?.bg_cor ?? HERO_DEFAULTS.bg_cor,
    bg_cor_2: h?.bg_cor_2 ?? HERO_DEFAULTS.bg_cor_2,
    texto_cor: h?.texto_cor ?? HERO_DEFAULTS.texto_cor,
  };
}

export function Hero({ override }: { override?: Partial<HeroData> } = {}) {
  const [hero, setHero] = useState<HeroData>(() => mergeHero(override));
  useEffect(() => {
    if (override) {
      setHero(mergeHero(override));
      return;
    }
    fetchHero().then((h) => setHero(mergeHero(h)));
  }, [override]);

  return (
    <section
      className={`relative overflow-hidden ${hero.bg_cor ? "" : "bg-gradient-to-br from-[var(--site-soft)] via-[var(--site-soft-2)] to-white"}`}
      style={{
        ...(hero.bg_cor ? { background: buildBackground(hero.bg_cor, hero.bg_cor_2) } : {}),
        ...(hero.texto_cor ? { color: hero.texto_cor } : {}),
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--site-soft-3)]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--site-soft-3)]/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeUp>
            <h1
              className={`text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl ${hero.texto_cor ? "" : "text-gray-900"}`}
              style={hero.texto_cor ? { color: hero.texto_cor } : undefined}
            >
              {hero.titulo}{" "}
              {hero.titulo_destaque && (
                <span className="bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)] bg-clip-text text-transparent">
                  {hero.titulo_destaque}
                </span>
              )}
              !
            </h1>

            <p
              className={`mt-6 max-w-xl text-lg leading-relaxed ${hero.texto_cor ? "opacity-90" : "text-gray-600"}`}
              style={hero.texto_cor ? { color: hero.texto_cor } : undefined}
            >
              {hero.subtitulo}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                id="whatsapp_start"
                href={hero.cta_primario_link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)] px-7 text-sm font-medium text-white shadow-lg shadow-[var(--site-primary)]/25 transition-all hover:from-[var(--site-primary-hover)] hover:to-[var(--site-primary-hover)]"
              >
                <Calendar className="h-4 w-4" />
                {hero.cta_primario_texto}
              </a>
              <a
                href={hero.cta_secundario_link ?? "#"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--site-soft-3)] hover:text-[var(--site-primary)]"
              >
                {hero.cta_secundario_texto}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </FadeUp>

          <FadeUp delay={0.15} className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-[var(--site-primary)]/10">
              {hero.imagem_url && (
                <img
                  src={hero.imagem_url}
                  alt="Atendimento infantojuvenil"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {hero.badge_enabled && (
              <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{hero.badge_titulo}</p>
                  <p className="text-xs text-gray-500">{hero.badge_subtitulo}</p>
                </div>
              </div>
            )}
          </FadeUp>
        </div>
      </div>
    </section>
  );
}