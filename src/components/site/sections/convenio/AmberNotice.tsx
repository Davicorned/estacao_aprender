import { Info, Zap } from "lucide-react";

const WA_PARTICULAR =
  "https://wa.me/5511966654857?text=" +
  encodeURIComponent("Olá! Gostaria de agendar uma consulta particular no Espaço IDE.");

export function AmberNotice() {
  return (
    <section className="border-y border-amber-200 bg-amber-50 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">
              <strong>Prazo médio de agendamento via convênio:</strong> 15+ dias
            </p>
          </div>
          <a
            id="whatsapp_start"
            href={WA_PARTICULAR}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            <Zap className="h-4 w-4" />
            Precisa de atendimento urgente? Agende particular em até 24h
          </a>
        </div>
      </div>
    </section>
  );
}