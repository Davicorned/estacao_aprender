import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { fetchTestimonials, type Testimonial } from "@/lib/cms";
import type { DepoimentosLayout } from "@/lib/site-templates";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

type Props = {
  initial?: Testimonial[];
  /** Layout — default "grade". */
  layout?: DepoimentosLayout;
  /** Aplica a grade e mosaico. */
  colunas?: 2 | 3;
  mostrar_estrelas?: boolean;
  mostrar_fonte?: boolean;
  /** Cabeçalho editável (com defaults). */
  eyebrow?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  /** Overrides visuais da seção (CSS background/color). */
  bg?: string | null;
  textColor?: string | null;
};

function Stars({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function Author({
  item, showFonte, textColor,
}: { item: Testimonial; showFonte: boolean; textColor: string | null }) {
  return (
    <div>
      <p className={`font-semibold ${textColor ? "" : "text-gray-900"}`} style={textColor ? { color: textColor } : undefined}>
        {item.nome}
      </p>
      {showFonte && item.fonte && (
        <p className={`text-sm ${textColor ? "opacity-70" : "text-gray-500"}`}
          style={textColor ? { color: textColor } : undefined}>
          via {item.fonte}
        </p>
      )}
    </div>
  );
}

export function Testimonials({
  initial,
  layout = "grade",
  colunas = 3,
  mostrar_estrelas = true,
  mostrar_fonte = true,
  eyebrow,
  titulo,
  descricao,
  bg,
  textColor: textColorProp,
}: Props = {}) {
  const [items, setItems] = useState<Testimonial[]>(initial ?? []);

  useEffect(() => {
    if (initial && initial.length > 0) { setItems(initial); return; }
    void fetchTestimonials().then(setItems);
  }, [initial]);

  if (items.length === 0) return null;

  const textColor = textColorProp || null;
  const sectionBg = bg || undefined;
  const sectionClass = bg ? "py-20" : "bg-gradient-to-b from-[var(--site-soft)] to-white py-20";
  const eyebrowText = eyebrow ?? "Depoimentos";
  const tituloText = titulo ?? "Cada evolução conta uma história";
  const descricaoText = descricao ?? "Histórias reais de famílias que encontraram apoio e transformação";

  const gridCols =
    colunas === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const mosaicCols =
    colunas === 2 ? "sm:columns-2" : "sm:columns-2 lg:columns-3";

  return (
    <section
      className={sectionClass}
      style={{
        ...(sectionBg ? { background: sectionBg } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-eyebrow)]">
            {eyebrowText}
          </span>
          <h2
            className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${textColor ? "" : "text-gray-900"}`}
            style={textColor ? { color: textColor } : undefined}
          >
            {tituloText}
          </h2>
          <p
            className={`mx-auto mt-4 max-w-2xl ${textColor ? "opacity-90" : "text-gray-600"}`}
            style={textColor ? { color: textColor } : undefined}
          >
            {descricaoText}
          </p>
        </FadeUp>

        {layout === "grade" && (
          <div className={`grid gap-6 ${gridCols}`}>
            {items.map((item, idx) => (
              <FadeUp key={item.id} delay={idx * 0.05}>
                <Card item={item} showStars={mostrar_estrelas} showFonte={mostrar_fonte} textColor={textColor} />
              </FadeUp>
            ))}
          </div>
        )}

        {layout === "faixa" && (
          <div className="rounded-3xl bg-[var(--site-soft)] p-6 sm:p-10">
            <div className={`grid gap-6 ${gridCols}`}>
              {items.map((item, idx) => (
                <FadeUp key={item.id} delay={idx * 0.05}>
                  <Card item={item} showStars={mostrar_estrelas} showFonte={mostrar_fonte} textColor={textColor} />
                </FadeUp>
              ))}
            </div>
          </div>
        )}

        {layout === "mosaico" && (
          <div className={`gap-6 ${mosaicCols}`}>
            {items.map((item) => (
              <div key={item.id} className="mb-6 break-inside-avoid">
                <Card item={item} showStars={mostrar_estrelas} showFonte={mostrar_fonte} textColor={textColor} />
              </div>
            ))}
          </div>
        )}

        {layout === "lista" && (
          <div className="mx-auto max-w-3xl divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:gap-6">
                <Quote className="h-6 w-6 shrink-0 text-[var(--site-primary)]" />
                <div className="min-w-0 flex-1">
                  <p className={`leading-relaxed ${textColor ? "" : "text-gray-700"}`}
                    style={textColor ? { color: textColor } : undefined}>
                    {item.texto}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <Author item={item} showFonte={mostrar_fonte} textColor={textColor} />
                    <Stars show={mostrar_estrelas} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {layout === "carrossel" && (
          <div className="mx-auto max-w-5xl px-8 sm:px-12">
            <Carousel opts={{ align: "start", loop: items.length > 1 }}>
              <CarouselContent>
                {items.map((item) => (
                  <CarouselItem key={item.id} className={colunas === 2 ? "md:basis-1/2" : "md:basis-1/2 lg:basis-1/3"}>
                    <Card item={item} showStars={mostrar_estrelas} showFonte={mostrar_fonte} textColor={textColor} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="!-left-2 sm:!-left-8" />
              <CarouselNext className="!-right-2 sm:!-right-8" />
            </Carousel>
          </div>
        )}

        {layout === "destaque" && (
          <div className="mx-auto max-w-3xl">
            <Carousel opts={{ loop: items.length > 1 }}>
              <CarouselContent>
                {items.map((item) => (
                  <CarouselItem key={item.id}>
                    <div className="flex flex-col items-center px-4 text-center">
                      <Quote className="h-14 w-14 text-[var(--site-soft-3)]" />
                      <p className={`mt-6 text-xl leading-relaxed sm:text-2xl ${textColor ? "" : "text-gray-800"}`}
                        style={textColor ? { color: textColor } : undefined}>
                        “{item.texto}”
                      </p>
                      <div className="mt-8 flex flex-col items-center gap-2">
                        <Stars show={mostrar_estrelas} />
                        <Author item={item} showFonte={mostrar_fonte} textColor={textColor} />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {items.length > 1 && (
                <>
                  <CarouselPrevious className="!-left-2 sm:!-left-8" />
                  <CarouselNext className="!-right-2 sm:!-right-8" />
                </>
              )}
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}

function Card({
  item, showStars, showFonte, textColor,
}: {
  item: Testimonial;
  showStars: boolean;
  showFonte: boolean;
  textColor: string | null;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border-0 bg-white p-6 shadow-lg shadow-gray-200/50 transition-shadow duration-300 hover:shadow-xl">
      <Quote className="h-8 w-8 text-[var(--site-soft-3)]" />
      <p className={`mt-4 mb-6 flex-1 leading-relaxed ${textColor ? "" : "text-gray-700"}`}
        style={textColor ? { color: textColor } : undefined}>
        {item.texto}
      </p>
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <Author item={item} showFonte={showFonte} textColor={textColor} />
        <Stars show={showStars} />
      </div>
    </div>
  );
}