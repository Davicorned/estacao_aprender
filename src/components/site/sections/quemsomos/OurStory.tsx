import { FadeUp } from "../../FadeUp";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";

const LOGO = logoAsset.url;

const DEFAULT_PARAGRAPHS = [
  "O Estação Aprender nasceu do sonho de criar um lugar onde crianças e adolescentes pudessem encontrar apoio especializado para seu desenvolvimento emocional e cognitivo, em um ambiente acolhedor e humanizado.",
  "Acreditamos que cada criança é única e merece um olhar individualizado. Por isso, reunimos profissionais de diferentes especialidades que trabalham de forma integrada, oferecendo uma abordagem completa e personalizada.",
  "Nosso compromisso é promover não apenas o bem-estar da criança, mas também fortalecer os vínculos familiares, criando um ambiente propício para o crescimento saudável e feliz.",
];

type Props = {
  eyebrow?: string;
  titulo?: string;
  paragrafos?: string[];
  imagem_url?: string | null;
};

export function OurStory({
  eyebrow = "Nossa história",
  titulo = "Nossa História",
  paragrafos = DEFAULT_PARAGRAPHS,
  imagem_url = LOGO,
}: Props = {}) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeUp>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {titulo}
            </h2>
            {paragrafos.map((p, i) => (
              <p key={i} className={`${i === 0 ? "mt-6" : "mt-4"} leading-relaxed text-gray-600`}>{p}</p>
            ))}
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--site-eyebrow)] to-[#FDDFC4] p-12">
              {imagem_url && (
                <img
                  src={imagem_url}
                  alt={titulo}
                  className="h-auto w-full max-w-sm object-contain"
                />
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}