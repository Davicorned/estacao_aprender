import { Heart, Award, Users, Shield } from "lucide-react";
import { FadeUp } from "../../FadeUp";

const values = [
  {
    icon: Heart,
    title: "Acolhimento",
    desc: "Ambiente acolhedor e seguro para crianças e famílias, onde cada pessoa se sente respeitada e compreendida.",
  },
  {
    icon: Award,
    title: "Excelência",
    desc: "Compromisso com a qualidade no atendimento, utilizando técnicas baseadas em evidências científicas.",
  },
  {
    icon: Users,
    title: "Cuidado Integral",
    desc: "Abordagem multidisciplinar que considera todos os aspectos do desenvolvimento infantojuvenil.",
  },
  {
    icon: Shield,
    title: "Transparência",
    desc: "Comunicação clara e honesta com as famílias sobre o processo terapêutico e evolução.",
  },
];

export function OurValues() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
            Nossos valores
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            O que nos guia
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.08} className="h-full">
              <div className="flex h-full flex-col rounded-xl border-0 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-eyebrow)] to-[#FDDFC4]">
                  <Icon className="h-7 w-7 text-[var(--site-primary)]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}