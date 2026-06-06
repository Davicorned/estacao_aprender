import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/1b4ae4335_Logo_novo.jpg";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-10 w-10 rounded-full object-cover" />
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
              ["Convênio", "/Convenio"],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className="text-gray-400 transition-colors hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Serviços */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Serviços</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ["Psicoterapia", "/Servicos?servico=psicoterapia"],
              ["Avaliação Neuropsicológica", "/Servicos?servico=neuropsicologia"],
              ["Fonoaudiologia", "/Servicos?servico=fonoaudiologia"],
              ["Psicopedagogia", "/Servicos?servico=psicopedagogia"],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className="text-gray-400 transition-colors hover:text-white">
                  {label}
                </a>
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
                href="https://wa.me/5511966654857"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                (11) 96665-4857
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
                <strong className="block text-gray-300">Taboão da Serra</strong>
                Estr. São Francisco, 2008 / Jardim Wanda - Sala 1303 e 1304 / Taboão da Serra - SP, 06765-904
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <span>
                <strong className="block text-gray-300">Morumbi</strong>
                Rua Doutor Luís Migliano, 1986 / Jardim Caboré - Conjunto 1419 / Morumbi - SP, 05711-001
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