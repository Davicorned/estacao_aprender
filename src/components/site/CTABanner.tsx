import { MessageCircle } from "lucide-react";
import { FadeUp } from "./FadeUp";

type Props = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
};

export function CTABanner({
  title = "Vamos conversar?",
  description = "Entre em contato com nossa equipe.",
  buttonLabel = "Falar no WhatsApp",
  href = "https://wa.me/5511932139815",
}: Props = {}) {
  return (
    <section className="bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)] py-20">
      <FadeUp className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{description}</p>
        <a
          id="whatsapp_start"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-lg font-medium text-[var(--site-primary)] shadow-xl transition-colors hover:bg-white/90"
        >
          <MessageCircle className="h-5 w-5" />
          {buttonLabel}
        </a>
      </FadeUp>
    </section>
  );
}