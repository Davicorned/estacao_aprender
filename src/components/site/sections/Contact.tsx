import { ArrowRight } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { DEFAULT_CONTATO_MAPA, type ContatoMapaLayout } from "@/lib/site-templates";
import { getLucideIcon } from "@/components/gestao/site/IconPicker";
import { useSiteContatos } from "@/lib/useSiteContatos";
import { telefoneHref } from "@/lib/cms";

type Props = {
  layout?: ContatoMapaLayout;
  eyebrow?: string;
  titulo?: string;
  descricao?: string;
  icone_telefone?: string;
  icone_email?: string;
  icone_endereco?: string;
  icone_horario?: string;
};

export function Contact({
  layout = "info-mapa",
  eyebrow = "Contato",
  titulo = "Entre em contato",
  descricao = "Estamos prontos para ajudar você e sua família",
  icone_telefone,
  icone_email,
  icone_endereco,
  icone_horario,
}: Props = {}) {
  const PhoneIcon = getLucideIcon(icone_telefone ?? DEFAULT_CONTATO_MAPA.icone_telefone ?? "Phone");
  const MailIcon = getLucideIcon(icone_email ?? DEFAULT_CONTATO_MAPA.icone_email ?? "Mail");
  const MapPinIcon = getLucideIcon(icone_endereco ?? DEFAULT_CONTATO_MAPA.icone_endereco ?? "MapPin");
  const ClockIcon = getLucideIcon(icone_horario ?? DEFAULT_CONTATO_MAPA.icone_horario ?? "Clock");

  const contatos = useSiteContatos();
  const primeiroEndereco = contatos.enderecos[0] ?? null;
  const mapa_embed_url = primeiroEndereco?.mapa_embed_url ?? "";
  const hasMap = !!mapa_embed_url;
  const endereco_titulo = primeiroEndereco?.rotulo ?? "";

  const telefoneCards = contatos.telefones.map((t) => {
    const href = telefoneHref(t);
    const isWpp = t.whatsapp_enabled;
    return (
      <a
        key={t.id}
        id={isWpp ? "whatsapp_start" : undefined}
        href={href}
        target={isWpp ? "_blank" : undefined}
        rel={isWpp ? "noopener noreferrer" : undefined}
        className={`group flex items-center gap-4 rounded-2xl p-4 transition-colors ${
          isWpp ? "bg-green-50 hover:bg-green-100" : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            isWpp ? "bg-green-500" : "bg-[var(--site-soft)]"
          }`}
        >
          <PhoneIcon className={`h-6 w-6 ${isWpp ? "text-white" : "text-[var(--site-primary)]"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {t.rotulo || (isWpp ? "WhatsApp" : "Telefone")}
          </p>
          <p className="text-sm text-gray-600">{t.telefone_exibido}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </a>
    );
  });

  const emailCards = contatos.emails.map((e) => (
    <a key={e.id} href={`mailto:${e.email}`} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-soft)]">
        <MailIcon className="h-6 w-6 text-[var(--site-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{e.rotulo || "E-mail"}</p>
        <p className="break-all text-sm text-gray-600">{e.email}</p>
      </div>
    </a>
  ));

  const enderecoCards = contatos.enderecos.map((en) => (
    <div key={`end-${en.id}`} className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-soft)]">
        <MapPinIcon className="h-6 w-6 text-[var(--site-primary)]" />
      </div>
      <div className="flex-1">
        {en.rotulo && <p className="text-sm font-semibold text-gray-900">{en.rotulo}</p>}
        <p className="text-sm text-gray-600">{en.endereco_texto}</p>
      </div>
    </div>
  ));

  const horarioCards = contatos.enderecos
    .filter((en) => !!en.horarios?.trim())
    .map((en) => (
      <div key={`hr-${en.id}`} className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-soft)]">
          <ClockIcon className="h-6 w-6 text-[var(--site-primary)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {en.rotulo ? `Horário — ${en.rotulo}` : "Horário de Funcionamento"}
          </p>
          {(en.horarios ?? "").split(/\r?\n/).filter(Boolean).map((h, i) => (
            <p key={i} className="text-sm text-gray-600">{h}</p>
          ))}
        </div>
      </div>
    ));

  const cards = [...telefoneCards, ...emailCards, ...enderecoCards, ...horarioCards];

  const mapEl = hasMap ? (
    <iframe
      title={endereco_titulo || "Mapa"}
      src={mapa_embed_url}
      width="100%"
      height="100%"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      style={{ border: 0, minHeight: 400 }}
    />
  ) : null;

  const Header = (
    <FadeUp className="mb-12 text-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {titulo}
      </h2>
      {descricao && <p className="mt-4 text-gray-600">{descricao}</p>}
    </FadeUp>
  );

  // ---------- mapa-fundo (full bleed) ----------
  if (layout === "mapa-fundo" && hasMap) {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {Header}
          <FadeUp>
            <div className="relative h-[560px] overflow-hidden rounded-3xl shadow-lg sm:h-[560px]">
              <div className="absolute inset-0">{mapEl}</div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-start p-3 sm:inset-y-0 sm:bottom-auto sm:left-0 sm:right-auto sm:w-full sm:max-w-md sm:items-center sm:p-8">
                <div className="w-full space-y-2 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur sm:space-y-3 sm:p-5">
                  {cards}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    );
  }

  // ---------- mapa-topo ----------
  if (layout === "mapa-topo") {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {Header}
          {hasMap && (
            <FadeUp>
              <div className="mb-10 h-[400px] overflow-hidden rounded-2xl shadow-lg">{mapEl}</div>
            </FadeUp>
          )}
          <FadeUp delay={0.1} className="grid gap-4 sm:grid-cols-2">
            {cards}
          </FadeUp>
        </div>
      </section>
    );
  }

  // ---------- so-info ----------
  if (layout === "so-info") {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {Header}
          <FadeUp className="space-y-4">{cards}</FadeUp>
        </div>
      </section>
    );
  }

  // ---------- cards-grade ----------
  if (layout === "cards-grade") {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {Header}
          <FadeUp className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards}
          </FadeUp>
          {hasMap && (
            <FadeUp delay={0.1}>
              <div className="mt-10 h-[400px] overflow-hidden rounded-2xl shadow-lg">{mapEl}</div>
            </FadeUp>
          )}
        </div>
      </section>
    );
  }

  // ---------- faixa ----------
  if (layout === "faixa") {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {Header}
          <FadeUp>
            <div className="flex flex-wrap items-stretch justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
              {cards.map((c, i) => (
                <div key={i} className="min-w-[220px] flex-1">
                  {c}
                </div>
              ))}
            </div>
          </FadeUp>
          {hasMap && (
            <FadeUp delay={0.1}>
              <div className="mt-10 h-[400px] overflow-hidden rounded-2xl shadow-lg">{mapEl}</div>
            </FadeUp>
          )}
        </div>
      </section>
    );
  }

  // ---------- info-mapa (default / atual) ----------
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {Header}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <FadeUp className="space-y-4">{cards}</FadeUp>
          {hasMap && (
            <FadeUp delay={0.15}>
              <div className="h-[400px] overflow-hidden rounded-2xl shadow-lg lg:h-full">{mapEl}</div>
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}