# Rebrand: IDE Psicologia → Estação Aprender

Mantém toda a estrutura. Troca logo, paleta laranja/marrom e referências ao nome. /Convenio mantém o cyan/blue propositalmente.

## Ajustes ao stack atual

O projeto roda Tailwind v4 (CSS-first, sem `tailwind.config.js`) e TanStack Start (sem `index.html` — meta vai em `__root.tsx`). Vou adaptar o prompt sem perder fidelidade:

- **Tokens** vão em `src/styles.css` via `@theme`, não em `tailwind.config.js`. Adiciono `--color-brand`, `--color-brand-dark`, `--color-brand-hover`, `--color-brand-hover-2`, `--color-brand-brown`, `--color-brand-50/100/200` (em oklch para casar com o sistema existente; mantenho hex em comentário como referência). Isso gera utilitários `bg-brand`, `text-brand`, etc. Também adiciono variáveis CSS hex `--brand-primary`, `--brand-gradient` etc. para uso em `style={}`.
- **Meta theme-color e título base** vão em `src/routes/__root.tsx`, não em `index.html`.

## Logo

- Upload do SVG via `lovable-assets` a partir de `/mnt/user-uploads/Logo-Estacao-Aprender-SVG_Logo-Primaria.svg`, gerando `src/assets/logo-estacao-aprender.svg.asset.json`.
- `Header.tsx`: trocar `LOGO` pelo `asset.url`, alt para "Estação Aprender", texto ao lado para "Estação Aprender". Remover `rounded-full object-cover` (SVG retangular 1920x1080, melhor `h-10 w-auto`).
- `Footer.tsx`: idem.

## Substituições de classes (apenas .tsx)

Substituições globais em `src/**/*.tsx`, exceto `src/components/site/sections/convenio/**`, `ConvenioForm.tsx`, `ConvenioObrigado.tsx` e `Convenio.tsx` (que usam cyan propositalmente — não tocar). Conforme tabela do prompt:

```
from-rose-500 → from-[#D67F43]
to-pink-500 → to-[#C4682E]
hover:from-rose-600 → hover:from-[#B85A24]
hover:to-pink-600 → hover:to-[#A04E1E]
shadow-rose-500 → shadow-[#D67F43]
text-rose-500 → text-[#D67F43]
text-rose-600 → text-[#B85A24]
text-rose-400 → text-[#D67F43]
hover:text-rose-500 → hover:text-[#D67F43]
hover:text-rose-700 → hover:text-[#B85A24]
hover:bg-rose-500 → hover:bg-[#D67F43]
from-rose-50 → from-[#FEF3E8]
to-pink-50 → to-[#FDDFC4]
via-pink-50 → via-[#FDDFC4]
bg-rose-50 → bg-[#FEF3E8]
bg-rose-100 → bg-[#FEF3E8]
bg-rose-200 → bg-[#FBCF9E]
bg-pink-200 → bg-[#FBCF9E]
border-rose-200 → border-[#FBCF9E]
from-rose-100 → from-[#FEF3E8]
to-pink-100 → to-[#FDDFC4]
```

Faço com `sed` em batch, restrito aos paths corretos, e depois reviso `Convenio*` para confirmar que ficou intacto.

O card rose "Não quer esperar?" dentro de `ConvenioFlow.tsx` será convertido para a paleta brand (laranja) — é parte da página /Convenio mas é o CTA-particular, então deve usar a brand. Confirmo após troca.

## Textos da marca

Substituir em todos os arquivos:
- "Espaço IDE Psicologia" / "IDE Psicologia" / "Espaço IDE" → "Estação Aprender"
- Footer copyright e alt-texts.

Email `ide.infantojuvenil@gmail.com`: o prompt diz "(atualizar para o e-mail real)" mas nenhum email novo foi fornecido. Mantenho temporariamente como `contato@estacaoaprender.com.br` (placeholder coerente com a marca). Marco no commit que o usuário deve confirmar o endereço real.

## Meta tags

Em `src/routes/__root.tsx`:
- title default "Estação Aprender"
- og:site_name "Estação Aprender"
- meta theme-color "#D67F43"
Reviso `head()` de cada rota para trocar "Espaço IDE Psicologia" → "Estação Aprender" nas strings de title/description/og.

## Fora de escopo

- Não crio `BrandButton.jsx` separado (não existe na base atual; cores aplicadas diretamente nas classes Tailwind).
- Não toco em `tailwind.config.js` (não existe — v4).
- `/Convenio` banner/form mantém cyan/blue.
