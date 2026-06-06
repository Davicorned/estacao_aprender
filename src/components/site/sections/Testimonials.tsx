import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { fetchTestimonials, type Testimonial } from "@/lib/cms";

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    void fetchTestimonials().then(setItems);
  }, []);

  if (items.length === 0) return null;

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
            <FadeUp key={item.id} delay={idx * 0.1}>
              <div className="flex h-full flex-col rounded-xl border-0 bg-white p-6 shadow-lg shadow-gray-200/50 transition-shadow duration-300 hover:shadow-xl">
                <Quote className="h-8 w-8 text-[#FBCF9E]" />
                <p className="mt-4 mb-6 flex-1 leading-relaxed text-gray-700">{item.texto}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.nome}</p>
                    {item.fonte && <p className="text-sm text-gray-500">via {item.fonte}</p>}
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