import { useEffect, useState } from "react";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { fetchHero, type SiteHero } from "@/lib/cms";

const DEFAULT: Pick<
  SiteHero,
  | "titulo"
  | "titulo_destaque"
  | "subtitulo"
  | "cta_primario_texto"
  | "cta_primario_link"
  | "cta_secundario_texto"
  | "cta_secundario_link"
  | "imagem_url"
  | "badge_enabled"
  | "badge_titulo"
  | "badge_subtitulo"
> = {
  titulo: "Cuidamos de cada fase de desenvolvimento do",
  titulo_destaque: "seu filho(a)",
  subtitulo:
    "Equipe multiprofissional especializada no cuidado integral de crianças e adolescentes. Acolhimento, diagnóstico e tratamento personalizados.",
  cta_primario_texto: "Agendar atendimento",
  cta_primario_link:
    "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.",
  cta_secundario_texto: "Conhecer serviços",
  cta_secundario_link: "/Servicos",
  imagem_url:
    "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png",
  badge_enabled: true,
  badge_titulo: "+500 famílias",
  badge_subtitulo: "atendidas com sucesso",
};

export function Hero() {
  const [hero, setHero] = useState(DEFAULT);
  useEffect(() => {
    fetchHero().then((h) => {
      if (!h) return;
      setHero({
        titulo: h.titulo ?? DEFAULT.titulo,
        titulo_destaque: h.titulo_destaque ?? DEFAULT.titulo_destaque,
        subtitulo: h.subtitulo ?? DEFAULT.subtitulo,
        cta_primario_texto: h.cta_primario_texto ?? DEFAULT.cta_primario_texto,
        cta_primario_link: h.cta_primario_link ?? DEFAULT.cta_primario_link,
        cta_secundario_texto: h.cta_secundario_texto ?? DEFAULT.cta_secundario_texto,
        cta_secundario_link: h.cta_secundario_link ?? DEFAULT.cta_secundario_link,
        imagem_url: h.imagem_url ?? DEFAULT.imagem_url,
        badge_enabled: h.badge_enabled,
        badge_titulo: h.badge_titulo ?? DEFAULT.badge_titulo,
        badge_subtitulo: h.badge_subtitulo ?? DEFAULT.badge_subtitulo,
      });
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FEF3E8] via-[#FDDFC4] to-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FBCF9E]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#FBCF9E]/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeUp>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {hero.titulo}{" "}
              {hero.titulo_destaque && (
                <span className="bg-gradient-to-r from-[#D67F43] to-[#C4682E] bg-clip-text text-transparent">
                  {hero.titulo_destaque}
                </span>
              )}
              !
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              {hero.subtitulo}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                id="whatsapp_start"
                href={hero.cta_primario_link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-7 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E]"
              >
                <Calendar className="h-4 w-4" />
                {hero.cta_primario_texto}
              </a>
              <a
                href={hero.cta_secundario_link ?? "#"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 text-sm font-medium text-gray-700 transition-colors hover:border-[#FBCF9E] hover:text-[#D67F43]"
              >
                {hero.cta_secundario_texto}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </FadeUp>

          <FadeUp delay={0.15} className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-[#D67F43]/10">
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