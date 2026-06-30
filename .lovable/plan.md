## Objetivo

Adicionar controle de **cor de fundo customizada** (preset + hexadecimal) em três pontos do admin de Layout:

1. **Seções da Home** (cada seção dinâmica)
2. **Rodapé**
3. **Banner / Hero** (cor de fundo atrás da imagem)

Hoje só existem dois fundos fixos ("branco" e "gradiente") nas seções, o rodapé é hard-coded em cinza escuro, e o Hero usa um gradiente fixo laranja-creme — sem nenhum controle no admin.

---

## Como vai funcionar (visão do usuário)

Em cada formulário (Seção, Rodapé, Hero) aparece um novo campo **"Cor de fundo"** com:

- **Presets clicáveis** (swatches): Branco, Creme, Cinza claro, Gradiente laranja, Cinza escuro (somente Rodapé), etc — diferentes por contexto.
- **Color picker nativo** (campo `<input type="color">`) + **input hex** lado a lado, permitindo digitar `#FAFAFA` direto.
- **Gradiente opcional** (Hero/Seções): segunda cor + checkbox "usar gradiente" → gera `linear-gradient(135deg, cor1, cor2)`.
- **Prévia ao vivo** já existente reflete a mudança imediatamente.

---

## Mudanças técnicas

### Banco (migration única)

Adicionar colunas opcionais para cor customizada:

```sql
-- Seções: já tem bg_style (preset). Adiciona cores custom.
ALTER TABLE public.site_secoes
  ADD COLUMN IF NOT EXISTS bg_cor text,        -- hex ou null
  ADD COLUMN IF NOT EXISTS bg_cor_2 text;      -- segunda cor p/ gradiente, opcional

-- Hero: novo campo de fundo
ALTER TABLE public.site_hero
  ADD COLUMN IF NOT EXISTS bg_cor text,
  ADD COLUMN IF NOT EXISTS bg_cor_2 text;

-- Rodapé: cor de fundo e cor do texto
ALTER TABLE public.site_rodape
  ADD COLUMN IF NOT EXISTS bg_cor text,
  ADD COLUMN IF NOT EXISTS texto_cor text;     -- claro/escuro
```

Regras de fallback:
- Se `bg_cor` for `null`, usa o preset/gradiente atual (compatibilidade total).
- Se `bg_cor` estiver setado, ele vence o preset.

### Tipagem em `src/lib/cms.ts`

Adicionar os novos campos a `SiteSecao`, `SiteHero`, `SiteRodape`. Pre‑popular `null` por padrão.

### Componente reutilizável `ColorField`

Criar `src/components/gestao/site/ColorField.tsx`:
- Props: `label`, `value`, `onChange`, `presets?: string[]`, `allowGradient?: boolean`, `value2?, onChange2?`.
- Renderiza: linha de swatches → `<input type="color">` → input hex (validado) → botão "Remover cor" (volta a `null` = usa preset).
- Aceita digitação `#RRGGBB` e sincroniza com o color picker.

### Aplicação nos editores

- **`SecoesManager.tsx`** (aba Aparência): substitui o select atual de `bg_style` por:
  - Preset (mantém: Branco / Gradiente creme).
  - `ColorField` com `allowGradient`.
- **`RodapeManager.tsx`**: adiciona seção "Aparência" com `ColorField` (cor de fundo) + toggle "Texto claro / Texto escuro" (auto‑contraste sugerido).
- **`HeroManager.tsx`**: nova seção "Fundo" com `ColorField` + `allowGradient`. Mantém a imagem por cima (que aparece só no desktop).

### Aplicação no site público

- **`DynamicSection.tsx`**: se `secao.bg_cor`, aplicar via `style={{ background: bg_cor_2 ? linear-gradient(...) : bg_cor }}`; senão usa o preset atual.
- **`Hero.tsx`**: idem; o gradiente atual (`from-[#FEF3E8]…`) vira fallback quando `bg_cor` for `null`.
- **`Footer.tsx`**: idem; quando `texto_cor === "escuro"` troca classes de texto/links para tons escuros.

### Compatibilidade com a prévia (iframe)

Como cores agora vão via `style` inline, funcionam automaticamente dentro do iframe da prévia — sem mudança no `PreviewFrame`.

---

## Entregáveis

1. SQL no arquivo `SUPABASE_MIGRATION_SITE_CMS_COLORS.sql` (para você colar no Supabase) com os 3 `ALTER TABLE`.
2. `ColorField` reutilizável (swatch + picker + hex).
3. Editores atualizados (Seções, Rodapé, Hero) com o novo campo.
4. Componentes do site honrando as cores salvas, com fallback para os defaults atuais.

Nada de localStorage, nada de cor hard‑coded nova — tudo segue os tokens existentes e a paleta da marca como preset inicial.