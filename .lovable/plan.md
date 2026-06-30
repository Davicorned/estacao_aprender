## Objetivo
Permitir ao admin editar o **Header (Cabeçalho)** do site via CMS, no mesmo padrão do Banner/Rodapé/Seções: logotipo, itens de menu, botão de CTA e cores.

## Banco (migração SQL — `SUPABASE_MIGRATION_SITE_HEADER.sql`)
Criar `site_header` (linha única, singleton):
- `id` uuid PK
- `logo_url` text
- `mostrar_nome` boolean (mostrar "Estação Aprender" ao lado do logo)
- `nome_marca` text
- `cta_label` text, `cta_to` text, `cta_visivel` boolean
- `bg_cor` text, `bg_cor_2` text (gradiente opcional), `texto_cor` text ('claro' | 'escuro')
- `cor_destaque` text (hover dos links e cor do CTA)
- `sticky` boolean
- `updated_at` timestamptz

Criar `site_header_itens` (itens de menu ordenáveis):
- `id`, `header_id` FK, `label`, `to`, `ordem` int, `visivel` boolean

GRANTs: `SELECT` para `anon` + `authenticated`; `ALL` para `service_role`. RLS habilitado: leitura pública; escrita só `authenticated`. Seed com os valores atuais (5 itens do NAV, CTA "Agendar Atendimento" → /Contato).

## Frontend público
- `src/lib/cms.ts`: tipos `SiteHeader` / `SiteHeaderItem`, `HEADER_DEFAULTS`, `getSiteHeader()` com cache e fallback (mesmo padrão de Hero/Footer).
- `src/components/site/Header.tsx`: passa a consumir `getSiteHeader()`. Renderiza itens, logo, nome, CTA e cores dinamicamente. Mantém comportamento mobile (Sheet) e Link tipado.

## Admin (Painel Gestão → Layout)
- `src/components/gestao/site/HeaderManager.tsx` novo, com abas:
  - **Conteúdo**: logo (URL), toggle nome, label/destino do CTA, lista de itens (add/remover/reordenar/visível).
  - **Aparência**: `ColorField` para `bg_cor` (+ gradiente), `cor_destaque`, toggle `texto_cor` claro/escuro, toggle sticky.
  - Preview ao vivo via `PreviewFrame`.
- `src/components/gestao/site/LayoutTabs.tsx`: adicionar aba "Cabeçalho" antes de "Banner".

## Entrega
Plano executado em um único passo de build; usuário roda o SQL no SQL Editor do Supabase para liberar persistência (igual fizemos com cores).