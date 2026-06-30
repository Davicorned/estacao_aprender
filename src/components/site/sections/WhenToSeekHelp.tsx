import { BookOpen, Heart, Brain, TrendingDown } from "lucide-react";
import { FadeUp } from "../FadeUp";

const IMG =
  "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/a73015a67_ChatGPT_Image_6_de_jan_de_2026__20_11_53.png";

const items = [
  { icon: BookOpen, label: "Dificuldades de aprendizagem" },
  { icon: Heart, label: "Ansiedade e medos" },
  { icon: Brain, label: "Problemas de comportamento" },
  { icon: TrendingDown, label: "Desmotivação escolar" },
];

export function WhenToSeekHelp() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeUp>
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img src={IMG} alt="Criança em atendimento" className="h-full w-full object-cover" />
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
              Atenção aos sinais
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Você sente que algo mudou, mas não sabe ao certo o quê?
            </h2>
            <p className="mt-6 leading-relaxed text-gray-600">
              Esse instinto que você tem — de que seu filho não está bem, mas é difícil colocar em
              palavras — merece ser levado a sério. Ansiedade, desmotivação, dificuldades de
              aprendizagem ou mudanças de comportamento são formas que a criança tem de pedir ajuda.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Reconhecer isso já é o primeiro passo. O segundo é saber que existe suporte
              especializado para caminhar junto com você e seu filho.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-[var(--site-eyebrow)] p-3"
                >
                  <Icon className="h-5 w-5 shrink-0 text-[var(--site-primary)]" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}