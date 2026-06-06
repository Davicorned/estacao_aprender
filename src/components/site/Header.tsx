import { useState } from "react";
import { Calendar, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const LOGO = "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/1b4ae4335_Logo_novo.jpg";

const NAV = [
  { label: "O Espaço", href: "/Particular" },
  { label: "Quem Somos", href: "/QuemSomos" },
  { label: "Serviços", href: "/Servicos" },
  { label: "Atendimento", href: "/Atendimento" },
  { label: "Convênio", href: "/Convenio" },
  { label: "Contato", href: "/Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="/Particular" className="flex items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-12 w-12 rounded-full object-cover" />
            <span className="hidden font-semibold text-gray-900 sm:inline">
              Estação Aprender
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#D67F43]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/Contato"
              className="hidden h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-6 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25 transition-all hover:from-[#B85A24] hover:to-[#A04E1E] sm:inline-flex"
            >
              <Calendar className="h-4 w-4" />
              Agendar Atendimento (24h)
            </a>

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
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-[#FEF3E8] hover:text-[#D67F43]"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a
                    href="/Contato"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] px-4 text-sm font-medium text-white shadow-lg shadow-[#D67F43]/25"
                  >
                    <Calendar className="h-4 w-4" />
                    Agendar Atendimento
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}