import * as Icons from "lucide-react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { FadeUp } from "../../FadeUp";
import { DEFAULT_MODALIDADES, type ModalidadeCard } from "@/lib/site-templates";

function getIcon(name?: string | null) {
  if (!name) return MapPin;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? MapPin;
}

type Props = {
  eyebrow?: string;
  titulo?: string;
  cards?: ModalidadeCard[];
};

export function Modalities({
  eyebrow = "Modalidades",
  titulo = "Escolha a melhor opção para o seu filho(a)",
  cards = DEFAULT_MODALIDADES.cards,
}: Props = {}) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {titulo}
          </h2>
        </FadeUp>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {cards.map((c, i) => {
            const Icon = getIcon(c.icone);
            const cor = c.cor || "var(--site-primary)";
            const isVar = cor.startsWith("var(");
            const external = c.cta_link?.startsWith("http");
            return (
              <FadeUp key={`${c.titulo}-${i}`} delay={i * 0.1}>
                <div className="overflow-hidden rounded-xl border-0 bg-white shadow-xl transition-shadow hover:shadow-2xl">
                  <div className="h-3" style={{ background: cor }} />
                  <div className="p-8">
                    <div
                      className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: isVar ? undefined : `${cor}1A`, background: isVar ? "var(--site-eyebrow)" : undefined }}
                    >
                      <Icon className="h-8 w-8" style={{ color: cor }} />
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">{c.titulo}</h3>
                    <p className="leading-relaxed text-gray-600">{c.descricao}</p>
                    {c.bullets?.length > 0 && (
                      <ul className="mt-6 mb-8 space-y-3">
                        {c.bullets.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: cor }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.cta_texto && c.cta_link && (
                      <a
                        id="whatsapp_start"
                        href={c.cta_link}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-all hover:opacity-90"
                        style={{ background: cor }}
                      >
                        {c.cta_texto}
                      </a>
                    )}
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}