import { useEffect, useState } from "react";
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Music2, Phone, Mail, MapPin } from "lucide-react";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import { fetchRodape, RODAPE_DEFAULTS, type LinkItem, type RedeSocial, type SiteRodape } from "@/lib/cms";
import { buildBackground } from "@/components/gestao/site/ColorField";

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

  const customBg = buildBackground(data.bg_cor);
  // Decide a paleta de texto. "claro" => textos claros (fundo escuro). "escuro" => textos escuros (fundo claro).
  const isLight = data.texto_cor === "escuro";
  const cls = isLight
    ? { footer: "text-gray-800", muted: "text-gray-600", strong: "text-gray-900", border: "border-gray-200", hover: "hover:text-gray-900", chip: "bg-black/5", link: "text-gray-600 hover:text-gray-900" }
    : { footer: "text-white", muted: "text-gray-400", strong: "text-gray-300", border: "border-gray-800", hover: "hover:text-white", chip: "bg-white/10", link: "text-gray-400 hover:text-white" };

  return (
    <footer
      className={`${customBg ? "" : "bg-gray-900"} ${cls.footer}`}
      style={customBg ? { background: customBg } : undefined}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Estação Aprender" className="h-10 w-auto" />
            <span className="text-lg font-semibold">Estação Aprender</span>
          </div>
          <p className={`mt-4 text-sm leading-relaxed ${cls.muted}`}>
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${cls.chip} transition-colors hover:bg-[#D67F43] hover:text-white`}
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
              <li key={i}><a href={l.href} className={`${cls.link} transition-colors`}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Serviços */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Serviços</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {data.links_servicos.map((l, i) => (
              <li key={i}><a href={l.href} className={`${cls.link} transition-colors`}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Contato</h4>
          <ul className={`mt-4 space-y-4 text-sm ${cls.muted}`}>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <a
                id="whatsapp_start"
                href={data.telefone_link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cls.hover}
              >
                {data.telefone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <a href={`mailto:${data.email ?? ""}`} className={`break-all ${cls.hover}`}>
                {data.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              <span>
                <strong className={`block ${cls.strong}`}>{data.endereco_titulo}</strong>
                {data.endereco_texto}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col items-center justify-between gap-4 border-t ${cls.border} pt-8 pb-8 text-sm ${cls.muted} md:flex-row mt-0`}>
          <p>{data.copyright}</p>
          <a
            href="https://www.solucoesmarketingdigital.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className={cls.hover}
          >
            Desenvolvimento: Soluções Marketing Digital
          </a>
        </div>
      </div>
    </footer>
  );
}