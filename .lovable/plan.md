## Problemas
1. Metade direita da tela fica vazia (`max-w-2xl` à esquerda) — obriga rolar.
2. Campos aparecem em branco no admin embora a Home mostre texto, porque o site público usa fallbacks (`DEFAULT` em `Hero.tsx` / `Footer.tsx`) que o admin não conhece.
3. "Botões de ação" sem nome no admin pelo mesmo motivo — o que aparece na Home vem do fallback, não do banco.

## Mudanças

### 1. Layout em 2 colunas com prévia ao vivo (Banner e Rodapé)
```text
┌──────────────────────────┬───────────────────────────┐
│ Formulário               │ Prévia ao vivo (sticky)   │
│  Imagem / Texto / Botões │  [Desktop] [Mobile]       │
│  Selo                    │  <Hero /> ou <Footer />   │
│                          │  com valores atuais       │
└──────────────────────────┴───────────────────────────┘
```
- `grid lg:grid-cols-[minmax(0,520px)_1fr]`, prévia `sticky top-4`.
- Em telas <lg volta para 1 coluna (form em cima, prévia abaixo).
- A prévia reusa os componentes reais (`<Hero />`, `<Footer />`) num wrapper escalado (mesma técnica já usada em `SecoesManager`), com toggle Desktop/Mobile.

### 2. Pré-preencher com defaults reais do site
- Extrair `DEFAULT` de `Hero.tsx` e do `Footer.tsx` para `src/lib/cms.ts` como `HERO_DEFAULTS` e `RODAPE_DEFAULTS` (fonte única).
- No `HeroManager` e `RodapeManager`, ao carregar: campos `null`/vazios herdam dos defaults antes de virem para o estado do form — o admin passa a mostrar exatamente o que aparece na Home.
- Marcar campos herdados com um pequeno rótulo "padrão do site" e botão "Restaurar padrão".

### 3. Prévia nunca vazia
- Form mesclado com defaults é o que alimenta a prévia, então fica completa mesmo durante digitação.
- Atualiza em tempo real (`useState`).

## Técnico
- Arquivos editados:
  - `src/components/gestao/site/HeroManager.tsx`
  - `src/components/gestao/site/RodapeManager.tsx`
  - `src/components/site/sections/Hero.tsx` (extrair DEFAULT)
  - `src/components/site/Footer.tsx` (extrair DEFAULT)
  - `src/lib/cms.ts` (exportar `HERO_DEFAULTS`, `RODAPE_DEFAULTS`)
  - Novo: `src/components/gestao/site/PreviewFrame.tsx` (wrapper escalado reutilizável)
- Sem mudanças em banco, RLS, rotas ou funcionalidade — só reorganização visual + herdar defaults.

## Fora do escopo
- Aba "Seções" (já redesenhada).
- Novos campos no banco.
- Versionamento/rascunho.
