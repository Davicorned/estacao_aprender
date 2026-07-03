import { MessageCircle } from "lucide-react";
import { FadeUp } from "./FadeUp";
import type { CtaBannerLayout } from "@/lib/site-templates";

type Props = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
  layout?: CtaBannerLayout;
  imagem_url?: string | null;
  bg?: string | null;
};

export function CTABanner({
  title = "Vamos conversar?",
  description = "Entre em contato com nossa equipe.",
  buttonLabel = "Falar no WhatsApp",
  href = "https://wa.me/5511932139815",
  layout = "centralizado",
  imagem_url,
  bg,
}: Props = {}) {
  const external = href.startsWith("http");
  const brandBg =
    "bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)]";
  const overrideStyle = bg ? { background: bg } : undefined;

  const buttonOnBrand = (
    <a
      id="whatsapp_start"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-8 text-lg font-medium text-[var(--site-primary)] shadow-xl transition-colors hover:bg-white/90"
    >
      <MessageCircle className="h-5 w-5" />
      {buttonLabel}
    </a>
  );

  if (layout === "dividido") {
    return (
      <section
        className={bg ? "py-20" : `${brandBg} py-20`}
        style={overrideStyle}
      >
        <FadeUp className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-lg text-white/90">{description}</p>
          </div>
          {buttonOnBrand}
        </FadeUp>
      </section>
    );
  }

  if (layout === "com-imagem") {
    const hasImg = !!imagem_url;
    return (
      <section
        className={hasImg ? "relative py-24" : bg ? "py-20" : `${brandBg} py-20`}
        style={
          hasImg
            ? {
                backgroundImage: `url(${imagem_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : overrideStyle
        }
      >
        {hasImg && (
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        )}
        <FadeUp className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            {description}
          </p>
          <div className="mt-8">{buttonOnBrand}</div>
        </FadeUp>
      </section>
    );
  }

  if (layout === "minimalista") {
    return (
      <section
        className={bg ? "py-14" : "bg-[var(--site-soft)] py-14"}
        style={overrideStyle}
      >
        <FadeUp className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-2xl border border-black/5 bg-white/70 px-6 py-6 text-center shadow-sm sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--site-text,#0f172a)] sm:text-2xl">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--site-text,#0f172a)]/70 sm:text-base">
                {description}
              </p>
            )}
          </div>
          <a
            id="whatsapp_start"
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--site-primary)] px-6 text-sm font-medium text-white shadow-md transition-colors hover:bg-[var(--site-primary-hover)]"
          >
            <MessageCircle className="h-4 w-4" />
            {buttonLabel}
          </a>
        </FadeUp>
      </section>
    );
  }

  // centralizado (default)
  return (
    <section className={bg ? "py-20" : `${brandBg} py-20`} style={overrideStyle}>
      <FadeUp className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          {description}
        </p>
        <div className="mt-8">{buttonOnBrand}</div>
      </FadeUp>
    </section>
  );
}