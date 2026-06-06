import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, MessageSquareQuote, ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const cards = [
  {
    to: "/admin/equipe",
    title: "Equipe",
    description: "Adicione, edite, remova e reordene os profissionais.",
    icon: Users,
  },
  {
    to: "/admin/depoimentos",
    title: "Depoimentos",
    description: "Gerencie os depoimentos exibidos no site.",
    icon: MessageSquareQuote,
  },
];

function AdminDashboard() {
  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-[#D67F43] hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3E8] text-[#D67F43]">
              <c.icon className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{c.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{c.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Em breve:</strong> Hero, Quando buscar ajuda, Nossa abordagem, Contato, e
        configurações globais (WhatsApp / email).
      </div>
    </AdminShell>
  );
}