## Problema

A prévia do Banner e do Rodapé renderiza o conteúdo dentro de um `<div>` com `width: 1280px` (desktop) ou `390px` (mobile) e aplica `transform: scale(...)`. O problema é que as media queries do Tailwind (`sm:`, `md:`, `lg:`) usam a **viewport real do navegador** (≈1403 px), não a largura simulada da prévia.

Resultado:
- **Banner mobile:** `lg:` ainda dispara, então o Hero tenta usar `lg:grid-cols-2` + `lg:text-6xl` dentro de um container de 390 px — o título quebra palavra-por-palavra e o layout fica completamente estourado (a imagem da prévia 2 confirma).
- **Rodapé desktop:** o painel direito do editor mede ≈500 px; com `width: 1280` forçado em conjunto com media queries da viewport real, o footer renderiza de forma inconsistente (colunas estreitas, e-mail quebrando letra-a-letra, como na prévia 1).

Em outras palavras, hoje a prévia mistura "largura simulada" com "media queries reais", e por isso nada bate com o que aparece no site.

## Solução

Renderizar a prévia dentro de um **`<iframe>`** com largura exata da viewport simulada (1280 desktop, 390 mobile) e fazer `transform: scale(...)` no próprio iframe. Dentro do iframe, as media queries respondem à largura simulada — Hero e Footer ficam idênticos ao que o usuário verá no site real.

### Mudanças

1. **`src/components/gestao/site/PreviewFrame.tsx`** — reescrever:
   - Renderizar um `<iframe>` com `width = 1280` (desktop) ou `390` (mobile) e altura suficiente.
   - Quando o iframe carrega, copiar as `<link rel="stylesheet">` e `<style>` do `document.head` para o `head` do iframe (assim o Tailwind funciona dentro).
   - Usar `createPortal(children, iframe.contentDocument.body)` para renderizar a árvore React lá dentro.
   - Aplicar `transform: scale(wrapperWidth / simulatedWidth)` no iframe; o wrapper externo segue com `overflow-hidden` e altura = `height * scale`.
   - Manter o toggle Desktop/Mobile e o `useLayoutEffect` que recalcula o scale no resize.

2. **`HeroManager.tsx` e `RodapeManager.tsx`** — sem mudanças de API: continuam passando `<Hero override={...} />` e `<Footer override={...} />` como children do `PreviewFrame`. Como o portal preserva o contexto do React, o `override` segue funcionando.

3. **Alturas da prévia** — manter `height={620}` / `mobileHeight={900}` para Hero; aumentar `mobileHeight` do Footer para ≈1200 (mobile do footer empilha 4 colunas + barra inferior). Como agora estará dentro de iframe com layout correto, o conteúdo cabe sem clipping.

### Detalhes técnicos

- O iframe usa `srcDoc="<!doctype html><html><head></head><body></body></html>"` para ser same-origin (permite `contentDocument` + portal).
- O efeito que injeta os styles roda no `onLoad` do iframe e também observa mudanças (basta clonar uma vez no mount; Tailwind no preview é estático).
- `transform-origin: top left` no iframe; `pointer-events: none` opcional para evitar interação acidental com botões da prévia.

### Validação

Após aplicar:
- Banner em mobile (390): título quebra em 2–3 linhas, imagem some (correto, `lg:hidden` no mobile real), badge no canto inferior.
- Banner em desktop (1280): grade 2 colunas, imagem visível, badge sobreposto.
- Rodapé em desktop: 4 colunas lado a lado, e-mail e endereço alinhados como no site.
- Rodapé em mobile: 1 coluna empilhada, sem clipping.

Sem mudanças em lógica/CMS; apenas no `PreviewFrame`.