import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/gestao/site/layout/secoes")({
  component: SecoesPlaceholder,
});

function SecoesPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF3E8] text-[#D67F43]">
        <Wrench className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">Seções dinâmicas — em breve</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Aqui você poderá criar novas seções da Home (texto + imagem, grade de
        cards, destaque) escolhendo um modelo pronto. Já entregamos Banner,
        Serviços e Rodapé editáveis nesta fase.
      </p>
    </div>
  );
}