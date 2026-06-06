import type { ReactNode } from "react";
import { FadeUp } from "./FadeUp";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  extra?: ReactNode;
};

export function PageBanner({ eyebrow, title, description, extra }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FEF3E8] to-[#FDDFC4] py-20">
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[#FBCF9E]/30 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#D67F43]">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">{description}</p>
          {extra && <div className="mt-8">{extra}</div>}
        </FadeUp>
      </div>
    </section>
  );
}