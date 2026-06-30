import * as Icons from "lucide-react";
import { Phone, ArrowRight } from "lucide-react";
import { FadeUp } from "../../FadeUp";

const WA = "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20particular%20no%20Esta%C3%A7%C3%A3o%20Aprender.";

type Item = { icone: string; titulo: string; descricao: string; link: string };

const DEFAULT_ITENS: Item[] = [
  {
    icone: "Phone",
    titulo: "Consulta Particular",
    descricao: "Atendimento rápido via WhatsApp. Agende sua consulta com nossa equipe.",
    link: WA,
  },
];

function getIcon(name?: string | null) {
  if (!name) return Phone;
  const I = (Icons as unknown as Record<string, any>)[name];
  return I ?? Phone;
}

type Props = { itens?: Item[] };

export function QuickChoiceCards({ itens = DEFAULT_ITENS }: Props = {}) {
  const external = (href: string) => href.startsWith("http");
  return (
    <section className="border-b border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mx-auto grid gap-6 ${itens.length > 1 ? "max-w-5xl md:grid-cols-2" : "max-w-2xl"}`}>
          {itens.map((it, i) => {
            const Icon = getIcon(it.icone);
            const ext = external(it.link);
            return (
              <FadeUp key={`${it.titulo}-${i}`} delay={i * 0.08}>
                <div className="rounded-xl border-2 border-[var(--site-soft-3)] bg-gradient-to-br from-[var(--site-soft)] to-[var(--site-soft-2)] p-6 shadow">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-gray-900">{it.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{it.descricao}</p>
                  <a
                    id="whatsapp_start"
                    href={it.link}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noopener noreferrer" : undefined}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    Chamar no WhatsApp
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}