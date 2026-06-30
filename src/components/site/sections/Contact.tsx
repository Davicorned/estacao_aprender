import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { DEFAULT_CONTATO_MAPA } from "@/lib/site-templates";

type Props = {
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
};

export function Contact({
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
}: Props = {}) {
  const waExternal = telefone_link.startsWith("http");
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {titulo}
          </h2>
          {descricao && <p className="mt-4 text-gray-600">{descricao}</p>}
        </FadeUp>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <FadeUp className="space-y-4">
            {telefone_link && (
              <a
                id="whatsapp_start"
                href={telefone_link}
                target={waExternal ? "_blank" : undefined}
                rel={waExternal ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 rounded-2xl bg-green-50 p-4 transition-colors hover:bg-green-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">{telefone}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-eyebrow)]">
                  <Mail className="h-6 w-6 text-[var(--site-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">E-mail</p>
                  <p className="break-all text-sm text-gray-600">{email}</p>
                </div>
              </a>
            )}

            {(endereco_titulo || endereco_texto) && (
              <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-eyebrow)]">
                  <MapPin className="h-6 w-6 text-[var(--site-primary)]" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    {endereco_titulo && (
                      <p className="text-sm font-semibold text-gray-900">{endereco_titulo}</p>
                    )}
                    {endereco_texto && (
                      <p className="text-sm text-gray-600">{endereco_texto}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {horarios && horarios.length > 0 && (
              <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-eyebrow)]">
                  <Clock className="h-6 w-6 text-[var(--site-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Horário de Funcionamento</p>
                  {horarios.map((h, i) => (
                    <p key={i} className="text-sm text-gray-600">{h}</p>
                  ))}
                </div>
              </div>
            )}
          </FadeUp>

          {mapa_embed_url && (
            <FadeUp delay={0.15}>
              <div className="h-[400px] overflow-hidden rounded-2xl shadow-lg lg:h-full">
                <iframe
                  title={endereco_titulo || "Mapa"}
                  src={mapa_embed_url}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, minHeight: 400 }}
                />
              </div>
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}