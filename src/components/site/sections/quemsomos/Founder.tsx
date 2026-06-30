import { FadeUp } from "../../FadeUp";
import founderAsset from "@/assets/founder-erica.png.asset.json";

const FOUNDER_IMG = founderAsset.url;

export function Founder() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            Idealizadora
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Erica Roberta Alves da Silva Cornedi
          </h2>
          <p className="mt-3 text-gray-600">
            Psicopedagoga · Psicomotricidade · Orientação Parental
          </p>

          <div className="mx-auto mt-10 w-full max-w-md">
            <img
              src={FOUNDER_IMG}
              alt="Erica Roberta Alves da Silva Cornedi"
              className="h-auto w-full object-contain"
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}