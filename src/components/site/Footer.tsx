import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";

const LOGO = logoAsset.url;

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-10 w-auto" />
            <span className="text-lg font-semibold">Estação Aprender</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Cuidando da saúde emocional de crianças, adolescentes e suas famílias com acolhimento e profissionalismo.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.instagram.com/espaco.ide/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#D67F43]"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#D67F43]"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Navegação */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Navegação</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ["O Espaço", "/Particular"],
              ["Quem Somos", "/QuemSomos"],
              ["Serviços", "/Servicos"],
              ["Atendimento", "/Atendimento"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link to={href} className="text-gray-400 transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Serviços */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Serviços</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ["Psicoterapia", "psicoterapia"],
              ["Avaliação Neuropsicológica", "neuropsicologia"],
              ["Fonoaudiologia", "fonoaudiologia"],
              ["Psicopedagogia", "psicopedagogia"],
            ].map(([label, servico]) => (
              <li key={servico}>
                <Link
                  to="/Servicos"
                  search={{ servico }}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Contato</h4>
          <ul className="mt-4 space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <a
                id="whatsapp_start"
                href="https://wa.me/5511932139815"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                (11) 93213-9815
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <a href="mailto:contato@estacaoaprender.com.br" className="break-all hover:text-white">
                contato@estacaoaprender.com.br
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <span>
                <strong className="block text-gray-300">Unidade Engenheiro Goulart</strong>
                Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 pb-8 text-sm text-gray-400 md:flex-row mt-0">
          <p>© 2026 Estação Aprender. Todos os direitos reservados.</p>
          <a
            href="https://www.solucoesmarketingdigital.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Desenvolvimento: Soluções Marketing Digital
          </a>
        </div>
      </div>
    </footer>
  );
}