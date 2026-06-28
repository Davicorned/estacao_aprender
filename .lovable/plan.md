
# Expansão do Admin do Site

Hoje o admin (`/gestao/site/*`) tem apenas **Equipe** e **Depoimentos**. Vamos adicionar **Serviços** e **Layout** (com Banners, Seções e Rodapé), todos com CRUD completo, mantendo o visual atual da Home.

## 1. Novo menu lateral em "Admin do Site"

```
Admin do Site
├── Equipe              (já existe)
├── Depoimentos         (já existe)
├── Serviços            (NOVO)
└── Layout              (NOVO)
    ├── Banner / Hero
    ├── Seções da Home
    └── Rodapé
```

## 2. Serviços (`/gestao/site/servicos`)

CRUD de cards de serviço usados na Home e na página de Serviços.

Campos por serviço:
- Título, descrição curta, ícone/imagem, ordem, ativo (on/off)
- Link interno opcional (ex.: `/servicos/psicologia`)

UI: lista com drag-to-reorder, botão "Novo serviço", modal de edição com upload de imagem (mesmo padrão de Equipe).

## 3. Layout > Banner / Hero (`/gestao/site/layout/hero`)

Formulário único (não é lista) para editar o Hero da Home:
- Título principal, subtítulo, texto do CTA, link do CTA
- Imagem de fundo (upload)
- Toggle "mostrar selo/destaque"

## 4. Layout > Seções da Home (`/gestao/site/layout/secoes`)

**Aqui está a parte central do pedido**: dar liberdade de criar/editar/remover seções extras na Home, sempre seguindo modelos visuais pré-definidos para não quebrar o design.

Cada seção tem:
- **Tipo de layout** (escolhido em uma lista fechada de templates já existentes):
  - `texto-imagem-esquerda` (estilo "Nossa Abordagem")
  - `texto-imagem-direita`
  - `grade-cards` (estilo "Quando buscar ajuda")
  - `destaque-centralizado` (banner com título + texto + CTA)
- Título, subtítulo, descrição (rich text simples)
- Imagem (upload, quando o template usa)
- Lista de itens/cards filhos (quando o template é grade)
- CTA opcional (texto + link)
- Ordem na Home, ativo on/off

UI: lista ordenável das seções com preview do tipo, botão "Nova seção" que abre um seletor visual de template e depois o formulário com apenas os campos relevantes daquele template.

As seções fixas atuais (Equipe, Depoimentos, Contato) continuam controladas pelos seus próprios admins; o que entra aqui são seções **adicionais** entre elas, posicionadas por `order`.

## 5. Layout > Rodapé (`/gestao/site/layout/rodape`)

Formulário único:
- Texto institucional curto
- Endereço, telefone, e-mail, horário
- Redes sociais (lista: tipo + URL)
- Links rápidos (lista: rótulo + URL)
- Texto de copyright

## 6. Banco de dados (novas tabelas)

Todas em `public` com `GRANT`s corretos, RLS habilitada, leitura pública (`anon SELECT enabled = true`) e escrita só para `authenticated` com role admin (via `has_role`).

- `site_servicos` (id, titulo, descricao, imagem_url, link, order, enabled)
- `site_hero` (singleton: id fixo, titulo, subtitulo, cta_texto, cta_link, imagem_url, badge_enabled)
- `site_secoes` (id, tipo, titulo, subtitulo, descricao, imagem_url, cta_texto, cta_link, order, enabled)
- `site_secao_itens` (id, secao_id FK, titulo, descricao, icone, order) — para templates de grade
- `site_rodape` (singleton: textos + JSONB para redes/links)

Imagens vão para o bucket de storage já usado por Equipe.

## 7. Renderização na Home

`src/routes/index.tsx` passa a montar a Home a partir do CMS:
- Hero → lê `site_hero`
- Seções fixas atuais (`WhenToSeekHelp`, `OurApproach`) são migradas como linhas-semente em `site_secoes` para que o admin possa editá-las sem perder o visual
- Loop de `site_secoes` ordenadas, renderizando um componente por `tipo`
- `TeamSection`, `Testimonials`, `Contact` permanecem como hoje
- `Footer` passa a ler `site_rodape`

Cache em `src/lib/cms.ts` extendido com `fetchHero`, `fetchSecoes`, `fetchServicos`, `fetchRodape` (mesmo padrão TTL/inflight).

## 8. Detalhes técnicos

- Novos arquivos de rota: `gestao.site.servicos.tsx`, `gestao.site.layout.tsx` (layout pai com sub-abas), `gestao.site.layout.hero.tsx`, `gestao.site.layout.secoes.tsx`, `gestao.site.layout.rodape.tsx`
- Novos componentes em `src/components/gestao/site/{servicos,layout}/`
- Novos componentes de render em `src/components/site/sections/dynamic/` — um por tipo de template
- Migração SQL única criando as 5 tabelas + grants + policies + seed das seções atuais
- Invalidar caches do `cms.ts` após cada save no admin

## 9. Entrega sugerida em duas fases

1. **Fase 1**: Serviços + Layout/Hero + Layout/Rodapé (formulários simples, ganho imediato).
2. **Fase 2**: Layout/Seções dinâmicas com templates (mais complexo, exige os componentes de render).

Confirma se quer que eu siga nessa ordem, ou prefere já entregar tudo de uma vez?
