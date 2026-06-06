import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeUp } from "../FadeUp";
import ericaAsset from "@/assets/founder-erica.png.asset.json";

type TeamMember = {
  nome: string;
  titulo: string;
  foto?: string | null;
  especialidades: string[];
  bio?: string;
  registro?: string;
};

const equipe: TeamMember[] = [
  {
    nome: "Érica Cornedi",
    titulo: "Fundadora",
    foto: ericaAsset.url,
    especialidades: [
      "Psicopedagogia",
      "Psicomotricidade",
      "ABA",
      "Alfabetização",
      "Reforço escolar",
    ],
    bio: "Fundadora da Estação Aprender. Especializada no atendimento de crianças com dificuldades de aprendizagem, transtornos do desenvolvimento e necessidade de olhar diferenciado.",
  },
];

function gridClasses(count: number) {
  if (count <= 1) return "grid grid-cols-1 gap-6 max-w-sm mx-auto";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto";
  if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto";
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto";
}

function TeamCard({ nome, titulo, foto, especialidades, bio, registro }: TeamMember) {
  const [open, setOpen] = useState(false);
  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-[#D67F43]/10">
      <div className="aspect-square overflow-hidden bg-[#FEF3E8]">
        {foto ? (
          <img
            src={foto}
            alt={nome}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D67F43] to-[#C4682E] text-4xl font-bold text-white">
              {iniciais}
            </div>
          </div>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-[#D67F43] to-[#C4682E]" />

      <div className="p-5">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{nome}</h3>
        <p className="mb-3 text-sm font-medium text-[#D67F43]">{titulo}</p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {especialidades.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#FEF3E8] px-2.5 py-1 text-xs font-medium text-[#B85A24]"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#D67F43]"
        >
          <span>{open ? "Menos detalhes" : "Ver detalhes"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 border-t border-gray-100 px-5 pt-4 pb-5">
          {registro && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Registro
              </p>
              <p className="text-sm text-gray-600">{registro}</p>
            </div>
          )}

          {bio && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Sobre
              </p>
              <p className="text-sm leading-relaxed text-gray-600">{bio}</p>
            </div>
          )}

          {especialidades.length > 3 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Todas as especialidades
              </p>
              <div className="flex flex-wrap gap-1.5">
                {especialidades.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#FEF3E8] px-2.5 py-1 text-xs font-medium text-[#B85A24]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-[#D67F43]">
            Nossa equipe
          </span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Profissionais especializados para o seu filho
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Cada profissional com dedicação específica ao desenvolvimento de crianças e adolescentes
          </p>
        </FadeUp>

        <div className={gridClasses(equipe.length)}>
          {equipe.map((profissional, idx) => (
            <FadeUp key={profissional.nome} delay={idx * 0.1}>
              <TeamCard {...profissional} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}