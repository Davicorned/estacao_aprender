import { FadeUp } from "../../FadeUp";

const FOUNDER_IMG =
  "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/d9d93910d_Karine_Mendes2.jpg";

export function Founder() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-rose-500">
            Idealizadora
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Dra Karine Mendes
          </h2>
          <p className="mt-3 text-gray-600">Neuropsicóloga pelo Albert Einstein</p>

          <div className="mx-auto mt-10 h-64 w-64 overflow-hidden rounded-full shadow-xl ring-4 ring-rose-100">
            <img src={FOUNDER_IMG} alt="Dra Karine Mendes" className="h-full w-full object-cover" />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}