import { MessageCircle } from "lucide-react";
import { FadeUp } from "./FadeUp";
import type { CtaBannerLayout } from "@/lib/site-templates";
import { useSiteContatos } from "@/lib/useSiteContatos";

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
  href,
  layout = "centralizado",
  imagem_url,
  bg,
}: Props = {}) {
  const { whatsappPrimarioHref } = useSiteContatos();
  const finalHref = href || whatsappPrimarioHref || "#";
  const external = finalHref.startsWith("http");
  const brandBg =
    "bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)]";
  const overrideStyle = bg ? { background: bg } : undefined;

  const buttonOnBrand = (
    <a
      id="whatsapp_start"
      href={finalHref}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex h-12 max-w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-center text-base font-medium text-[var(--site-primary)] shadow-xl transition-colors hover:bg-white/90 sm:h-14 sm:px-8 sm:text-lg"
    >
      <MessageCircle className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
      <span className="truncate">{buttonLabel}</span>
    </a>
  );

  if (layout === "dividido") {
    return (
      <section
        className={bg ? "py-14 sm:py-20" : `${brandBg} py-14 sm:py-20`}
        style={overrideStyle}
      >
        <FadeUp className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-8">
          <div className="w-full min-w-0 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-base text-white/90 sm:text-lg">{description}</p>
          </div>
          <div className="w-full md:w-auto">{buttonOnBrand}</div>
        </FadeUp>
      </section>
    );
  }

  if (layout === "com-imagem") {
    const hasImg = !!imagem_url;
    return (
      <section
        className={
          hasImg
            ? "relative py-16 sm:py-24"
            : bg
              ? "py-14 sm:py-20"
              : `${brandBg} py-14 sm:py-20`
        }
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
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            {description}
          </p>
          <div className="mt-6 flex justify-center sm:mt-8">{buttonOnBrand}</div>
        </FadeUp>
      </section>
    );
  }

  if (layout === "minimalista") {
    return (
      <section
        className={bg ? "py-10 sm:py-14" : "bg-[var(--site-soft)] py-10 sm:py-14"}
        style={overrideStyle}
      >
        <FadeUp className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-2xl border border-black/5 bg-white/70 px-4 py-6 text-center shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:text-left">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--site-text,#0f172a)] sm:text-2xl">
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
            className="inline-flex h-11 w-full max-w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--site-primary)] px-6 text-sm font-medium text-white shadow-md transition-colors hover:bg-[var(--site-primary-hover)] sm:w-auto"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">{buttonLabel}</span>
          </a>
        </FadeUp>
      </section>
    );
  }

  // centralizado (default)
  return (
    <section
      className={bg ? "py-14 sm:py-20" : `${brandBg} py-14 sm:py-20`}
      style={overrideStyle}
    >
      <FadeUp className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
          {description}
        </p>
        <div className="mt-6 flex justify-center sm:mt-8">{buttonOnBrand}</div>
      </FadeUp>
    </section>
  );
}