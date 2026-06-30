import { MapPin, Video, CheckCircle2 } from "lucide-react";
import { FadeUp } from "../../FadeUp";

const WA = "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.";

const presencial = [
  "Ambiente lúdico e acolhedor",
  "Salas equipadas com materiais especializados",
  "Localização de fácil acesso",
  "Estacionamento disponível",
];

const online = [
  "Flexibilidade de horários",
  "Sem necessidade de deslocamento",
  "Ideal para quem mora longe",
  "Plataforma segura e privada",
];

export function Modalities() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            Modalidades
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Escolha a melhor opção para o seu filho(a)
          </h2>
        </FadeUp>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Presencial */}
          <FadeUp>
            <div className="overflow-hidden rounded-xl border-0 bg-white shadow-xl transition-shadow hover:shadow-2xl">
              <div className="h-3 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)]" />
              <div className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--site-eyebrow)]">
                  <MapPin className="h-8 w-8 text-[var(--site-primary)]" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">Presencial</h3>
                <p className="leading-relaxed text-gray-600">
                  Atendimento em nosso espaço físico, ambiente acolhedor e preparado especialmente
                  para crianças e adolescentes.
                </p>
                <ul className="mt-6 mb-8 space-y-3">
                  {presencial.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--site-primary)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  id="whatsapp_start"
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)] text-sm font-medium text-white shadow-lg shadow-[var(--site-primary)]/25 transition-all hover:from-[var(--site-primary-hover)] hover:to-[var(--site-primary-hover)]"
                >
                  Agendar presencial
                </a>
              </div>
            </div>
          </FadeUp>

          {/* Online */}
          <FadeUp delay={0.1}>
            <div className="overflow-hidden rounded-xl border-0 bg-white shadow-xl transition-shadow hover:shadow-2xl">
              <div className="h-3 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100">
                  <Video className="h-8 w-8 text-cyan-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">Online</h3>
                <p className="leading-relaxed text-gray-600">
                  Atendimento por videochamada com a mesma qualidade do presencial, no conforto da sua casa.
                </p>
                <ul className="mt-6 mb-8 space-y-3">
                  {online.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  id="whatsapp_start"
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-600 hover:to-blue-600"
                >
                  Agendar online
                </a>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}