import { Calendar } from "lucide-react";
import { FadeUp } from "../FadeUp";

const IMG =
  "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/89a88ba32_WhatsApp_Image_2023-12-09_at_002649.jpeg";
const WA_LINK =
  "https://wa.me/5511966654857?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20atendimento%20no%20Espa%C3%A7o%20IDE.";

export function OurApproach() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeUp className="lg:order-1">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#D67F43]">
              Nossa abordagem
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Apoio especializado para o desenvolvimento infantojuvenil
            </h2>
            <p className="mt-6 leading-relaxed text-gray-600">
              No Estação Aprender, oferecemos um atendimento especializado para crianças e suas famílias,
              proporcionando suporte emocional e terapêutico de forma personalizada. Com técnicas adaptadas
              à demanda de cada paciente, idade, contexto familiar e escolar.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Nossos profissionais atuam para estimular o desenvolvimento infantil de maneira eficaz.
              Através de intervenções assertivas e diagnósticos precisos, ajudamos a identificar e tratar
              dificuldades emocionais, comportamentais e de aprendizagem.
            </p>

            <a
              id="whatsapp_start"
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-7 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E]"
            >
              <Calendar className="h-4 w-4" />
              Agende um atendimento!
            </a>
          </FadeUp>

          <FadeUp delay={0.15} className="lg:order-2">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img src={IMG} alt="Espaço da clínica" className="h-full w-full object-cover" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}