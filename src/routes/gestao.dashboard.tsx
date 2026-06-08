import { createFileRoute } from "@tanstack/react-router";
import { Users, Calendar, Activity, DollarSign } from "lucide-react";
import { GestaoShell } from "@/components/gestao/GestaoShell";
import { StatCard } from "@/components/gestao/StatCard";

export const Route = createFileRoute("/gestao/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <GestaoShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pacientes cadastrados" value="—" icon={Users} hint="Disponível após Fase 2" />
        <StatCard label="Agendamentos hoje" value="—" icon={Calendar} hint="Disponível após Fase 2" />
        <StatCard label="Sessões no mês" value="—" icon={Activity} hint="Disponível após Fase 2" />
        <StatCard label="Receita do mês" value="R$ —" icon={DollarSign} hint="Disponível após Fase 2" />
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Próximas fases:</strong> Agenda, Pacientes, Contratos e Financeiro serão ativados
        com as tabelas correspondentes. Por enquanto, use o menu "Admin do site" para gerenciar
        Equipe e Depoimentos.
      </div>
    </GestaoShell>
  );
}