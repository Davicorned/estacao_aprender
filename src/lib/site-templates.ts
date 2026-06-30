import type { SecaoTipo } from "@/lib/cms";

export type TemplateCampo =
  | "eyebrow"
  | "titulo"
  | "descricao"
  | "descricao_extra"
  | "imagem_url"
  | "cta"
  | "itens"
  | "dados";

export type TemplateItemConfig = {
  icone?: boolean;
  descricao?: boolean;
  link?: boolean;
};

export type SectionTemplate = {
  tipo: SecaoTipo;
  label: string;
  descricao: string;
  /** Nome do ícone lucide-react */
  icon: string;
  grupo: "texto-imagem" | "cards" | "conteudo" | "chamada-contato";
  campos: TemplateCampo[];
  item?: TemplateItemConfig;
  /** Forma do objeto `dados` quando o template usa payload estruturado. */
  dadosSchema?: "modalidades" | "contato-mapa";
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    tipo: "texto-imagem-esquerda",
    label: "Imagem à esquerda",
    descricao: "Texto à direita, imagem grande à esquerda.",
    icon: "Image",
    grupo: "texto-imagem",
    campos: ["eyebrow", "titulo", "descricao", "descricao_extra", "imagem_url", "cta"],
  },
  {
    tipo: "texto-imagem-direita",
    label: "Imagem à direita",
    descricao: "Texto à esquerda, imagem grande à direita.",
    icon: "LayoutTemplate",
    grupo: "texto-imagem",
    campos: ["eyebrow", "titulo", "descricao", "descricao_extra", "imagem_url", "cta"],
  },
  {
    tipo: "grade-cards",
    label: "Grade de cards",
    descricao: "Imagem + texto + cards (ícone, título, descrição curta).",
    icon: "Grid3x3",
    grupo: "cards",
    campos: ["eyebrow", "titulo", "descricao", "imagem_url", "itens", "cta"],
    item: { icone: true, descricao: true },
  },
  {
    tipo: "cards-icones",
    label: "Cards com ícones",
    descricao: "Grade de cards (ícone, título, descrição e link opcional). Ideal para valores ou atalhos.",
    icon: "LayoutGrid",
    grupo: "cards",
    campos: ["eyebrow", "titulo", "itens"],
    item: { icone: true, descricao: true, link: true },
  },
  {
    tipo: "passos-processo",
    label: "Passos numerados",
    descricao: "Etapas numeradas com ícone, título e descrição. Bom para explicar um processo.",
    icon: "ListOrdered",
    grupo: "conteudo",
    campos: ["eyebrow", "titulo", "itens"],
    item: { icone: true, descricao: true },
  },
  {
    tipo: "accordion",
    label: "Lista expansível",
    descricao: "Lista de itens que abrem ao clicar — FAQ, serviços, etc.",
    icon: "ListCollapse",
    grupo: "conteudo",
    campos: ["eyebrow", "titulo", "itens"],
    item: { icone: true, descricao: true },
  },
  {
    tipo: "cta-banner",
    label: "Faixa de chamada",
    descricao: "Faixa larga com título, descrição e botão sobre fundo da marca.",
    icon: "Megaphone",
    grupo: "chamada-contato",
    campos: ["titulo", "descricao", "cta"],
  },
  {
    tipo: "destaque-pessoa",
    label: "Destaque de pessoa",
    descricao: "Foto centralizada com nome, cargo/legenda — ideal para idealizadora ou liderança.",
    icon: "UserCircle2",
    grupo: "conteudo",
    campos: ["eyebrow", "titulo", "descricao", "imagem_url"],
  },
  {
    tipo: "modalidades",
    label: "Cards comparativos",
    descricao: "Dois cards ricos com cor, ícone, lista de bullets e botão. Bom para comparar opções.",
    icon: "Columns2",
    grupo: "cards",
    campos: ["eyebrow", "titulo", "dados"],
    dadosSchema: "modalidades",
  },
  {
    tipo: "contato-mapa",
    label: "Contato + mapa",
    descricao: "Informações de contato (WhatsApp, e-mail, endereço, horários) + iframe de mapa.",
    icon: "MapPin",
    grupo: "chamada-contato",
    campos: ["eyebrow", "titulo", "descricao", "dados"],
    dadosSchema: "contato-mapa",
  },
];

export const SECTION_TEMPLATES_BY_TIPO: Record<SecaoTipo, SectionTemplate> =
  SECTION_TEMPLATES.reduce((acc, t) => {
    acc[t.tipo] = t;
    return acc;
  }, {} as Record<SecaoTipo, SectionTemplate>);

export const GRUPO_LABEL: Record<SectionTemplate["grupo"], string> = {
  "texto-imagem": "Texto e imagem",
  cards: "Cards",
  conteudo: "Conteúdo",
  "chamada-contato": "Chamada / Contato",
};

/** Lista curta de ícones lucide para o seletor de itens. */
export const ICONES_SUGERIDOS = [
  "Sparkles", "Heart", "Award", "Users", "Shield", "Star",
  "BookOpen", "Brain", "Smile", "Sun", "Calendar", "Clock",
  "CheckCircle2", "MessageSquare", "MessageCircle", "Phone", "Mail",
  "MapPin", "Video", "ClipboardCheck", "ClipboardList", "FileText",
  "GraduationCap", "TrendingDown", "TrendingUp", "Lightbulb", "Target",
  "ArrowRight",
];

/** Modalidades default — usadas em prévias e como exemplo no admin. */
export type ModalidadeCard = {
  titulo: string;
  descricao: string;
  icone: string;
  cor: string; // hex (cor de destaque do card)
  bullets: string[];
  cta_texto: string;
  cta_link: string;
};

export type DadosModalidades = { cards: ModalidadeCard[] };

/** Contato + mapa */
export type DadosContatoMapa = {
  telefone: string;
  telefone_link: string;
  email: string;
  endereco_titulo: string;
  endereco_texto: string;
  horarios: string[];
  mapa_embed_url: string;
};

export const DEFAULT_MODALIDADES: DadosModalidades = {
  cards: [
    {
      titulo: "Presencial",
      descricao:
        "Atendimento em nosso espaço físico, ambiente acolhedor e preparado especialmente para crianças e adolescentes.",
      icone: "MapPin",
      cor: "var(--site-primary)",
      bullets: [
        "Ambiente lúdico e acolhedor",
        "Salas equipadas com materiais especializados",
        "Localização de fácil acesso",
        "Estacionamento disponível",
      ],
      cta_texto: "Agendar presencial",
      cta_link:
        "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.",
    },
    {
      titulo: "Online",
      descricao:
        "Atendimento por videochamada com a mesma qualidade do presencial, no conforto da sua casa.",
      icone: "Video",
      cor: "#06b6d4",
      bullets: [
        "Flexibilidade de horários",
        "Sem necessidade de deslocamento",
        "Ideal para quem mora longe",
        "Plataforma segura e privada",
      ],
      cta_texto: "Agendar online",
      cta_link:
        "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.",
    },
  ],
};

export const DEFAULT_CONTATO_MAPA: DadosContatoMapa = {
  telefone: "(11) 93213-9815",
  telefone_link:
    "https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.",
  email: "contato@estacaoaprender.com.br",
  endereco_titulo: "Unidade Engenheiro Goulart",
  endereco_texto: "Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040",
  horarios: ["Segunda a Sexta: 8h às 20h", "Sábado: 8h às 14h"],
  mapa_embed_url:
    "https://www.google.com/maps?q=Pra%C3%A7a%20Gaj%C3%A9%2C%2056%20-%20Eng.%20Goulart%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003725-040&output=embed",
};