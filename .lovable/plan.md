# Plano — Clone página /Particular IDE Psicologia (Morumbi)

Vou implementar a página exatamente conforme a especificação fornecida, usando a stack atual do projeto (TanStack Start + React + Tailwind v4 + shadcn/ui + lucide-react), adaptando apenas onde necessário para casar com a arquitetura do template.

## Adaptações da stack
- **Roteamento**: TanStack Router (não Next/Vite SPA). A rota `/Particular` vira `src/routes/Particular.tsx`. Também substituirei a home placeholder por um redirect/link para `/Particular` (a página principal solicitada).
- **Tailwind v4**: classes utilitárias usadas no spec (`bg-rose-500`, `from-rose-500`, `bg-gray-900`, etc.) já funcionam nativamente no v4 — sem necessidade de tokens custom. Manterei o `styles.css` existente.
- **Fonte Inter**: adicionada via `<link>` no `__root.tsx` head (não via `@import` no CSS, conforme regras Tailwind v4) + `--font-sans` no `@theme`.
- **Animações**: usar `framer-motion` (instalar via `bun add framer-motion`) com o padrão `fadeUp` do spec.
- **shadcn Sheet** para menu mobile do header.
- **Imagens externas**: usar URLs do `media.base44.com` diretamente (conforme spec).

## Arquivos a criar/editar

```
src/routes/__root.tsx              → adicionar <link> Inter no head
src/routes/index.tsx               → substituir placeholder; renderizar a página Particular (ou redirect)
src/routes/Particular.tsx          → página principal montando as 5 seções + Header + Footer + WhatsAppFloat
src/components/site/Header.tsx     → header sticky com logo, nav, CTA gradient, menu mobile (Sheet)
src/components/site/Footer.tsx     → footer 4 colunas bg-gray-900
src/components/site/WhatsAppFloat.tsx → botão flutuante verde fixed bottom-right
src/components/site/sections/Hero.tsx
src/components/site/sections/WhenToSeekHelp.tsx
src/components/site/sections/OurApproach.tsx
src/components/site/sections/Testimonials.tsx
src/components/site/sections/Contact.tsx
src/components/site/FadeUp.tsx     → wrapper framer-motion reutilizável
src/styles.css                     → adicionar --font-sans: Inter no @theme
```

Rotas auxiliares (`/QuemSomos`, `/Servicos`, `/Atendimento`, `/Contato`) **NÃO** serão criadas — os `<Link>`s vão como `<a href>` simples para não quebrar o type-check do TanStack Router (apenas `/Particular` existe). Documento isso como nota.

## Conteúdo (verbatim do spec)
- Todos os textos PT-BR, URLs de imagem, números de WhatsApp, endereços e depoimentos são copiados literalmente da especificação fornecida pelo usuário.
- `id="whatsapp_start"` em todos os `<a>` para wa.me.
- Mapa Google via `<iframe>` com a URL fornecida.

## Detalhes técnicos chave
- **Header**: `sticky top-0 z-50 bg-white/95 backdrop-blur border-b`, `h-20`, gradient CTA `from-rose-500 to-pink-500` com ícone `Calendar` (lucide).
- **Hero**: blobs absolutos `bg-rose-200/30 rounded-full blur-3xl`, grid 2 col, card flutuante "+500 famílias" com `CheckCircle2` verde.
- **Seção 2**: ícones `BookOpen`, `Heart`, `Brain`, `TrendingDown` em pílulas `bg-rose-50`.
- **Seção 3**: imagem à direita (ordem invertida no grid via `lg:order-2`).
- **Depoimentos**: 3 cards shadcn `Card`, ícone `Quote` rose-200, 5 estrelas `Star` amber-400 fill.
- **Contato**: 4 cards (WhatsApp verde, E-mail/Endereços/Horário em rose-100) + iframe Google Maps.
- **Footer**: grid 4 col, ícones sociais `Instagram`/`Facebook` em círculos `bg-white/10 hover:bg-rose-500`.
- **WhatsAppFloat**: SVG inline (não há ícone WhatsApp puro no lucide-react que combine).
- **Animações**: cada coluna/seção envolvida em `<FadeUp>` com `whileInView` + `viewport={{ once: true }}`.

## Passos
1. Instalar `framer-motion`.
2. Atualizar `__root.tsx` (Inter link) e `styles.css` (font-sans token).
3. Criar componentes globais (Header, Footer, WhatsAppFloat, FadeUp).
4. Criar as 5 seções.
5. Criar `src/routes/Particular.tsx` montando tudo + atualizar `src/routes/index.tsx` para renderizar o mesmo conteúdo (home = Particular, como no site original).
6. Verificar preview visualmente.

Pronto para implementar quando aprovado.