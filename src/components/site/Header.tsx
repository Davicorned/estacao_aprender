import { useState } from "react";
import { Calendar, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";

const LOGO = logoAsset.url;

const NAV = [
  { label: "O Espaço", to: "/" },
  { label: "Quem Somos", to: "/QuemSomos" },
  { label: "Serviços", to: "/Servicos" },
  { label: "Atendimento", to: "/Atendimento" },
  { label: "Contato", to: "/Contato" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-12 w-auto" />
            <span className="hidden font-semibold text-gray-900 sm:inline">
              Estação Aprender
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#D67F43]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/Contato"
              className="hidden h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-6 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E] sm:inline-flex"
            >
              <Calendar className="h-4 w-4" />
              Agendar Atendimento
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-700 lg:hidden"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="text-left">Menu</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#FEF3E8] hover:text-[#D67F43]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/Contato"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-4 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25"
                  >
                    <Calendar className="h-4 w-4" />
                    Agendar Atendimento
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}