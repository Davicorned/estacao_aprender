import { useEffect, useState } from "react";
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Music2, Phone, Mail, MapPin } from "lucide-react";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import { fetchRodape, RODAPE_DEFAULTS, type LinkItem, type RedeSocial, type SiteRodape } from "@/lib/cms";

const LOGO = logoAsset.url;

const DEFAULT = RODAPE_DEFAULTS;

const REDE_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: Phone,
  tiktok: Music2,
};

function FooterLink({ item }: { item: LinkItem }) {
  return (
    <a href={item.href} className="text-gray-400 transition-colors hover:text-white">
      {item.label}
    </a>
  );
}

type RodapeData = Omit<SiteRodape, "id">;

function mergeRodape(r: Partial<RodapeData> | null | undefined): RodapeData {
  return {
    ...DEFAULT,
    ...(r ?? {}),
    texto_institucional: r?.texto_institucional || DEFAULT.texto_institucional,
    telefone: r?.telefone || DEFAULT.telefone,
    telefone_link: r?.telefone_link || DEFAULT.telefone_link,
    email: r?.email || DEFAULT.email,
    endereco_titulo: r?.endereco_titulo || DEFAULT.endereco_titulo,
    endereco_texto: r?.endereco_texto || DEFAULT.endereco_texto,
    copyright: r?.copyright || DEFAULT.copyright,
    redes_sociais: r?.redes_sociais?.length ? r.redes_sociais : DEFAULT.redes_sociais,
    links_rapidos: r?.links_rapidos?.length ? r.links_rapidos : DEFAULT.links_rapidos,
    links_servicos: r?.links_servicos?.length ? r.links_servicos : DEFAULT.links_servicos,
  };
}

export function Footer({ override }: { override?: Partial<RodapeData> } = {}) {
  const [data, setData] = useState<RodapeData>(() => mergeRodape(override));
  useEffect(() => {
    if (override) {
      setData(mergeRodape(override));
      return;
    }
    fetchRodape().then((r) => setData(mergeRodape(r)));
  }, [override]);

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
            {data.texto_institucional}
          </p>
          <div className="mt-6 flex gap-3">
            {data.redes_sociais.map((r: RedeSocial, i) => {
              const Icon = REDE_ICONS[r.tipo] ?? Instagram;
              return (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.tipo}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#D67F43]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Navegação */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Navegação</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {data.links_rapidos.map((l, i) => (
              <li key={i}><FooterLink item={l} /></li>
            ))}
          </ul>
        </div>

        {/* Serviços */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Serviços</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {data.links_servicos.map((l, i) => (
              <li key={i}><FooterLink item={l} /></li>
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
                href={data.telefone_link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                {data.telefone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <a href={`mailto:${data.email ?? ""}`} className="break-all hover:text-white">
                {data.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <span>
                <strong className="block text-gray-300">{data.endereco_titulo}</strong>
                {data.endereco_texto}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 pb-8 text-sm text-gray-400 md:flex-row mt-0">
          <p>{data.copyright}</p>
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