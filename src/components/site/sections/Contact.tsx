import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { FadeUp } from "../FadeUp";

const WA_LINK =
  "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.";

export function Contact() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            Contato
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Entre em contato
          </h2>
          <p className="mt-4 text-gray-600">
            Estamos prontos para ajudar você e sua família
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <FadeUp className="space-y-4">
            {/* WhatsApp */}
            <a
              id="whatsapp_start"
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl bg-green-50 p-4 transition-colors hover:bg-green-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">(11) 93213-9815</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
            </a>

            {/* E-mail */}
            <a
              href="mailto:contato@estacaoaprender.com.br"
              className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-eyebrow)]">
                <Mail className="h-6 w-6 text-[var(--site-primary)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">E-mail</p>
                <p className="break-all text-sm text-gray-600">contato@estacaoaprender.com.br</p>
              </div>
            </a>

            {/* Endereço */}
            <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-eyebrow)]">
                <MapPin className="h-6 w-6 text-[var(--site-primary)]" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Unidade Engenheiro Goulart</p>
                  <p className="text-sm text-gray-600">
                    Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040
                  </p>
                </div>
              </div>
            </div>

            {/* Horário */}
            <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--site-eyebrow)]">
                <Clock className="h-6 w-6 text-[var(--site-primary)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Horário de Funcionamento</p>
                <p className="text-sm text-gray-600">Segunda a Sexta: 8h às 20h</p>
                <p className="text-sm text-gray-600">Sábado: 8h às 14h</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="h-[400px] overflow-hidden rounded-2xl shadow-lg lg:h-full">
              <iframe
                title="Mapa Unidade Engenheiro Goulart"
                src="https://www.google.com/maps?q=Pra%C3%A7a%20Gaj%C3%A9%2C%2056%20-%20Eng.%20Goulart%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003725-040&output=embed"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, minHeight: 400 }}
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}