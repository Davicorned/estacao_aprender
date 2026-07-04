import { createFileRoute } from "@tanstack/react-router";
import { ServicosSection } from "@/components/gestao/config/ServicosSection";

export const Route = createFileRoute("/gestao/servicos")({
  component: ServicosPage,
});

function ServicosPage() {
  return (
    <div className="space-y-6">
      <ServicosSection />
    </div>
  );
}