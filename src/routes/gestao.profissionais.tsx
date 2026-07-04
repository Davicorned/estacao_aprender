import { createFileRoute } from "@tanstack/react-router";
import { ProfissionaisSection } from "@/components/gestao/config/ProfissionaisSection";

export const Route = createFileRoute("/gestao/profissionais")({
  component: ProfissionaisPage,
});

function ProfissionaisPage() {
  return (
    <div className="space-y-6">
      <ProfissionaisSection />
    </div>
  );
}
