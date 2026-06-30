import { FadeUp } from "../../FadeUp";
import founderAsset from "@/assets/founder-erica.png.asset.json";

const FOUNDER_IMG = founderAsset.url;

type Props = {
  eyebrow?: string;
  titulo?: string;
  legenda?: string;
  imagem_url?: string | null;
};

export function Founder({
  eyebrow = "Idealizadora",
  titulo = "Erica Roberta Alves da Silva Cornedi",
  legenda = "Psicopedagoga · Psicomotricidade · Orientação Parental",
  imagem_url = FOUNDER_IMG,
}: Props = {}) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {titulo}
          </h2>
          {legenda && <p className="mt-3 text-gray-600">{legenda}</p>}

          {imagem_url && (
            <div className="mx-auto mt-10 w-full max-w-md">
              <img
                src={imagem_url}
                alt={titulo}
                className="h-auto w-full object-contain"
              />
            </div>
          )}
        </FadeUp>
      </div>
    </section>
  );
}