import { FadeUp } from "@/components/site/FadeUp";

export function ConvenioBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 py-20">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <span className="inline-flex rounded-md bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 shadow">
            Plano de saúde
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Atendimento por Convênio
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Deixe seus dados e nossa equipe entrará em contato para verificar a elegibilidade
            do seu plano e agendar sua consulta.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}