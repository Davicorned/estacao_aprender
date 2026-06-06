import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { FadeUp } from "../FadeUp";

const WA_LINK =
  "https://wa.me/5511966654857?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Espa%C3%A7o%20IDE.";

export function Contact() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#D67F43]">
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
                <p className="text-sm text-gray-600">(11) 96665-4857</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
            </a>

            {/* E-mail */}
            <a
              href="mailto:contato@estacaoaprender.com.br"
              className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FEF3E8]">
                <Mail className="h-6 w-6 text-[#D67F43]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">E-mail</p>
                <p className="break-all text-sm text-gray-600">contato@estacaoaprender.com.br</p>
              </div>
            </a>

            {/* Endereço */}
            <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FEF3E8]">
                <MapPin className="h-6 w-6 text-[#D67F43]" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Unidade Taboão da Serra</p>
                  <p className="text-sm text-gray-600">
                    Estr. São Francisco, 2008 / Jardim Wanda - Sala 1303 e 1304 / Taboão da Serra - SP, 06765-904
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Unidade Morumbi</p>
                  <p className="text-sm text-gray-600">
                    Rua Doutor Luís Migliano, 1986 / Jardim Caboré - Conjunto 1419 / Morumbi - SP, 05711-001
                  </p>
                </div>
              </div>
            </div>

            {/* Horário */}
            <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FEF3E8]">
                <Clock className="h-6 w-6 text-[#D67F43]" />
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
                title="Mapa Morumbi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.494!2d-46.72456!3d-23.61584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce574b5e2a3d5b%3A0xa1234567890abcde!2sR.+Dr.+Lu%C3%ADs+Migliano%2C+1986+-+Jardim+Cabor%C3%A9%2C+S%C3%A3o+Paulo+-+SP%2C+05711-001!5e0!3m2!1spt-BR!2sbr!4v1700000000001!5m2!1spt-BR!2sbr"
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