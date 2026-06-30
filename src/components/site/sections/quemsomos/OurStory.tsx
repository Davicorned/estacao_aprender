import { FadeUp } from "../../FadeUp";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";

const LOGO = logoAsset.url;

export function OurStory() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeUp>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--site-primary)]">
              Nossa história
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nossa História
            </h2>
            <p className="mt-6 leading-relaxed text-gray-600">
              O Estação Aprender nasceu do sonho de criar um lugar onde crianças e adolescentes pudessem
              encontrar apoio especializado para seu desenvolvimento emocional e cognitivo, em um
              ambiente acolhedor e humanizado.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Acreditamos que cada criança é única e merece um olhar individualizado. Por isso,
              reunimos profissionais de diferentes especialidades que trabalham de forma integrada,
              oferecendo uma abordagem completa e personalizada.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Nosso compromisso é promover não apenas o bem-estar da criança, mas também fortalecer
              os vínculos familiares, criando um ambiente propício para o crescimento saudável e feliz.
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--site-eyebrow)] to-[#FDDFC4] p-12">
              <img
                src={LOGO}
                alt="Estação Aprender"
                className="h-auto w-full max-w-sm object-contain"
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}