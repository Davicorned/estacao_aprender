import { Quote, Star } from "lucide-react";
import { FadeUp } from "../FadeUp";

const items = [
  {
    name: "Yuri Caroline",
    text: "Tenho uma experiência muito positiva com o Espaço Ide. É um lugar acolhedor e aconchegante, onde meu filho faz terapia e se sente bem. O ambiente é agradável e ainda conta com um cafezinho que faz toda a diferença enquanto esperamos. Recomendo!",
  },
  {
    name: "Daniela De Oliveira Silva Ribeiro",
    text: "O Estação Aprender é um ambiente acolhedor e bem organizado, com oficinas criativas e envolventes. Meu filho participa das oficinas e a última foi a de Páscoa e ele adorou! Atividades bem planejadas, com cuidado e estímulo à criatividade. Recomendo bastante!",
  },
  {
    name: "Isah Adriano",
    text: "Tive uma experiência muito boa no Estação Aprender. A equipe é super atenciosa, acolhedora e dá pra ver que realmente se importam com as crianças. Além do espaço belíssimo e acolhedor, os profissionais passam bastante segurança, explicam tudo direitinho e mantêm a gente sempre informado. Dá pra perceber o cuidado e a dedicação no trabalho. Recomendo pra quem procura um atendimento mais humano e de confiança.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-gradient-to-b from-[#FEF3E8] to-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#D67F43]">
            Depoimentos
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Cada evolução conta uma história
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Histórias reais de famílias que encontraram apoio e transformação
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <FadeUp key={item.name} delay={idx * 0.1}>
              <div className="flex h-full flex-col rounded-xl border-0 bg-white p-6 shadow-lg shadow-gray-200/50 transition-shadow duration-300 hover:shadow-xl">
                <Quote className="h-8 w-8 text-rose-200" />
                <p className="mt-4 mb-6 flex-1 leading-relaxed text-gray-700">{item.text}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">via Google</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}