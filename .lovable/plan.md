# Cores de texto e cards no CMS do site

Hoje cada bloco (Hero/Banner, Seções, Rodapé, Cabeçalho) só permite escolher a **cor de fundo** (e em alguns casos um "tema claro/escuro" pré-definido). Vamos liberar:

- **Cor do texto** (hex livre, com gradient/paleta) em todos.
- **Cor dos cards** (fundo + borda + texto) nas Seções (templates com grid de ícones) e no Rodapé (blocos de colunas / agrupadores). Banner e Cabeçalho não têm "cards", então recebem só cor de texto + (no caso do Header) cor já existente de destaque.

## O que muda em cada bloco

| Bloco | Novos campos |
| --- | --- |
| Banner (Hero) | `texto_cor` (hex) — substitui o toggle claro/escuro atual |
| Seções dinâmicas | `texto_cor`, `card_bg_cor`, `card_texto_cor`, `card_borda_cor` |
| Rodapé | `texto_cor` (hex), `card_bg_cor`, `card_texto_cor` (aplica nos blocos/colunas) |
| Cabeçalho | `texto_cor` (hex) — substitui o toggle claro/escuro atual; `cor_destaque` continua |

Quando o campo for `null`, mantém o comportamento atual (defaults da marca / tema escuro/claro automático), então nada quebra para quem já configurou.

## Migration SQL (novo arquivo `SUPABASE_MIGRATION_SITE_CMS_TEXT_CARDS.sql`)

```sql
ALTER TABLE public.site_hero      ADD COLUMN IF NOT EXISTS texto_cor text;
ALTER TABLE public.site_header    ADD COLUMN IF NOT EXISTS texto_cor_hex text;
ALTER TABLE public.site_rodape    ADD COLUMN IF NOT EXISTS texto_cor_hex text,
                                  ADD COLUMN IF NOT EXISTS card_bg_cor text,
                                  ADD COLUMN IF NOT EXISTS card_texto_cor text;
ALTER TABLE public.site_secoes    ADD COLUMN IF NOT EXISTS texto_cor text,
                                  ADD COLUMN IF NOT EXISTS card_bg_cor text,
                                  ADD COLUMN IF NOT EXISTS card_texto_cor text,
                                  ADD COLUMN IF NOT EXISTS card_borda_cor text;
```

O usuário roda no SQL Editor do Supabase (mesmo padrão das migrações anteriores de cor).

Mantemos as colunas atuais (`texto_cor` claro/escuro em Hero/Header/Rodapé) para retrocompatibilidade — o novo campo `texto_cor_hex` (Header/Rodapé) e o reaproveitamento de `texto_cor` em Hero/Seções como hex tomam precedência quando preenchidos.

## Frontend

1. **`src/lib/cms.ts`** — adicionar os novos campos nos types `SiteHero`, `SiteHeader`, `SiteRodape`, `SiteSecao` e nos `*_DEFAULTS` (todos `null`).
2. **`src/components/site/sections/Hero.tsx`** — se `texto_cor` (hex) preenchido, aplicar `color: var` no container e propagar via `style`/CSS var aos títulos/parágrafos.
3. **`src/components/site/sections/dynamic/DynamicSection.tsx`** — aplicar `texto_cor` no container; nos templates com cards (grid de ícones), aplicar `card_bg_cor`/`card_texto_cor`/`card_borda_cor` inline em cada card.
4. **`src/components/site/Footer.tsx`** — aplicar `texto_cor_hex` no texto geral; aplicar `card_bg_cor`/`card_texto_cor` nas colunas/cards do rodapé.
5. **`src/components/site/Header.tsx`** — se `texto_cor_hex` definido, sobrepõe o esquema claro/escuro nos links e na marca.

## Admin (UI)

Em cada manager, adicionar uma seção **"Cores do texto e cards"** logo após o `ColorField` de fundo existente, usando o componente `ColorField` (já suporta hex + paleta + gradient):

- **`HeroManager.tsx`**: `ColorField` "Cor do texto".
- **`SecoesManager.tsx`**: `ColorField` "Cor do texto" + grupo "Cards" com 3 campos (`card_bg_cor`, `card_texto_cor`, `card_borda_cor`). Aparece só nos templates que renderizam cards (icon grid).
- **`RodapeManager.tsx`**: `ColorField` "Cor do texto" + "Cor de fundo dos blocos" + "Cor do texto dos blocos".
- **`HeaderManager.tsx`**: `ColorField` "Cor do texto" (mantém o toggle claro/escuro como fallback automático).

Todos usam `setForm((f) => ({ ...f, ... }))` para evitar o bug de stale state corrigido recentemente.

## Validação após implementar

1. Rodar a migration no Supabase.
2. Em `/gestao/site/layout/*`, escolher cores e salvar.
3. Verificar na Home que cada bloco reflete as cores; e que limpar (X "Usar padrão") volta ao visual original.

Posso seguir e implementar?
