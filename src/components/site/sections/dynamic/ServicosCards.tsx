import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { FadeUp } from "../../FadeUp";
import { fetchServicos, type SiteSecao, type SiteServico } from "@/lib/cms";
import { buildBackground } from "@/components/gestao/site/ColorField";

function getIcon(name?: string | null) {
  if (!name) return Sparkles;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? Sparkles;
}

export function ServicosCards({ secao }: { secao: SiteSecao }) {
  const [items, setItems] = useState<SiteServico[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void fetchServicos(false).then((data) => {
      if (!alive) return;
      setItems(data);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const customBg = buildBackground(secao.bg_cor, secao.bg_cor_2);
  const bg = customBg
    ? ""
    : secao.bg_style === "gradiente"
      ? "bg-gradient-to-b from-gray-50 to-white"
      : "bg-white";
  const textColor = secao.texto_cor || null;
  const cardBg = secao.card_bg_cor || null;
  const cardText = secao.card_texto_cor || null;
  const cardBorder = secao.card_borda_cor || null;
  const cardStyle = {
    ...(cardBg ? { backgroundColor: cardBg } : {}),
    ...(cardText ? { color: cardText } : {}),
    borderColor: cardBorder ?? "rgba(0,0,0,0.06)",
    borderWidth: 0.5,
    borderStyle: "solid" as const,
    borderRadius: 12,
  };

  return (
    <section
      className={`${bg} py-20`}
      style={{
        ...(customBg ? { background: customBg } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-3xl text-center">
          {secao.eyebrow && (
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-eyebrow)]">
              {secao.eyebrow}
            </span>
          )}
          {secao.titulo && (
            <h2
              className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${textColor ? "" : "text-gray-900"}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {secao.titulo}
            </h2>
          )}
          {secao.descricao && (
            <p
              className={`mt-6 leading-relaxed ${textColor ? "opacity-90" : "text-gray-600"}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {secao.descricao}
            </p>
          )}
        </FadeUp>

        {loaded && items.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s, i) => {
              const Icon = getIcon(s.icone);
              return (
                <FadeUp key={s.id} delay={i * 0.05}>
                  <div
                    className="flex h-full flex-col overflow-hidden bg-white transition-shadow hover:shadow-md"
                    style={cardStyle}
                  >
                    <div className="relative h-44 w-full bg-[var(--site-soft)]">
                      {s.imagem_url ? (
                        <img
                          src={s.imagem_url}
                          alt={s.titulo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon className="h-14 w-14 text-[var(--site-primary)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3
                        className={`text-lg font-semibold ${cardText ? "" : "text-gray-900"}`}
                        style={cardText ? { color: cardText } : undefined}
                      >
                        {s.titulo}
                      </h3>
                      {s.descricao && (
                        <p
                          className={`mt-2 flex-1 text-sm leading-relaxed ${cardText ? "opacity-80" : "text-gray-600"}`}
                          style={cardText ? { color: cardText } : undefined}
                        >
                          {s.descricao}
                        </p>
                      )}
                      {s.link && (
                        <a
                          href={s.link}
                          target={s.link.startsWith("http") ? "_blank" : undefined}
                          rel={s.link.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--site-primary)] hover:opacity-80"
                        >
                          Saiba mais <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        )}

        {secao.cta_texto && secao.cta_link && (
          <div className="mt-12 text-center">
            <a
              href={secao.cta_link}
              target={secao.cta_link.startsWith("http") ? "_blank" : undefined}
              rel={secao.cta_link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)] px-7 text-sm font-medium text-white shadow-lg shadow-[var(--site-primary)]/25 transition-all hover:from-[var(--site-primary-hover)] hover:to-[var(--site-primary-hover)]"
            >
              <Calendar className="h-4 w-4" />
              {secao.cta_texto}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}