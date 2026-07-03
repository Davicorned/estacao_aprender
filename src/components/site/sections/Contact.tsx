import { ArrowRight } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { DEFAULT_CONTATO_MAPA, type ContatoMapaLayout } from "@/lib/site-templates";
import { getLucideIcon } from "@/components/gestao/site/IconPicker";

type Props = {
  layout?: ContatoMapaLayout;
  eyebrow?: string;
  titulo?: string;
  descricao?: string;
  telefone?: string;
  telefone_link?: string;
  email?: string;
  endereco_titulo?: string;
  endereco_texto?: string;
  horarios?: string[];
  mapa_embed_url?: string;
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
  telefone = DEFAULT_CONTATO_MAPA.telefone,
  telefone_link = DEFAULT_CONTATO_MAPA.telefone_link,
  email = DEFAULT_CONTATO_MAPA.email,
  endereco_titulo = DEFAULT_CONTATO_MAPA.endereco_titulo,
  endereco_texto = DEFAULT_CONTATO_MAPA.endereco_texto,
  horarios = DEFAULT_CONTATO_MAPA.horarios,
  mapa_embed_url = DEFAULT_CONTATO_MAPA.mapa_embed_url,
  icone_telefone,
  icone_email,
  icone_endereco,
  icone_horario,
}: Props = {}) {
  const waExternal = telefone_link.startsWith("http");
  const PhoneIcon = getLucideIcon(icone_telefone ?? DEFAULT_CONTATO_MAPA.icone_telefone ?? "Phone");
  const MailIcon = getLucideIcon(icone_email ?? DEFAULT_CONTATO_MAPA.icone_email ?? "Mail");
  const MapPinIcon = getLucideIcon(icone_endereco ?? DEFAULT_CONTATO_MAPA.icone_endereco ?? "MapPin");
  const ClockIcon = getLucideIcon(icone_horario ?? DEFAULT_CONTATO_MAPA.icone_horario ?? "Clock");

  const hasMap = !!mapa_embed_url;

  const whatsappCard = telefone_link ? (
    <a
      id="whatsapp_start"
      href={telefone_link}
      target={waExternal ? "_blank" : undefined}
      rel={waExternal ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-2xl bg-green-50 p-4 transition-colors hover:bg-green-100"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500">
        <PhoneIcon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
        <p className="text-sm text-gray-600">{telefone}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
    </a>
  ) : null;

  const emailCard = email ? (
    <a href={`mailto:${email}`} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-soft)]">
        <MailIcon className="h-6 w-6 text-[var(--site-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">E-mail</p>
        <p className="break-all text-sm text-gray-600">{email}</p>
      </div>
    </a>
  ) : null;

  const enderecoCard = (endereco_titulo || endereco_texto) ? (
    <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-soft)]">
        <MapPinIcon className="h-6 w-6 text-[var(--site-primary)]" />
      </div>
      <div className="flex-1">
        {endereco_titulo && <p className="text-sm font-semibold text-gray-900">{endereco_titulo}</p>}
        {endereco_texto && <p className="text-sm text-gray-600">{endereco_texto}</p>}
      </div>
    </div>
  ) : null;

  const horariosCard = horarios && horarios.length > 0 ? (
    <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-soft)]">
        <ClockIcon className="h-6 w-6 text-[var(--site-primary)]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">Horário de Funcionamento</p>
        {horarios.map((h, i) => (
          <p key={i} className="text-sm text-gray-600">{h}</p>
        ))}
      </div>
    </div>
  ) : null;

  const cards = [whatsappCard, emailCard, enderecoCard, horariosCard].filter(Boolean);

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
            <div className="relative h-[560px] overflow-hidden rounded-3xl shadow-lg">
              <div className="absolute inset-0">{mapEl}</div>
              <div className="absolute inset-y-0 left-0 flex w-full max-w-md items-center p-4 sm:p-8">
                <div className="w-full space-y-3 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
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