import { Phone, ArrowRight } from "lucide-react";
import { FadeUp } from "../../FadeUp";

const WA = "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20particular%20no%20Esta%C3%A7%C3%A3o%20Aprender.";

export function QuickChoiceCards() {
  return (
    <section className="border-b border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Particular */}
          <FadeUp>
            <div className="rounded-xl border-2 border-[#FBCF9E] bg-gradient-to-br from-[var(--site-eyebrow)] to-[#FDDFC4] p-6 shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">Consulta Particular</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Atendimento rápido via WhatsApp. Agende sua consulta com nossa equipe.
              </p>
              <a
                id="whatsapp_start"
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                Chamar no WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}