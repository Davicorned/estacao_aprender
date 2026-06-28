## Objetivo
Adicionar um botão de alternância de tema (claro/escuro) no painel de gestão, com paleta de modo escuro confortável para usuários sensíveis a brilho.

## Escopo
Aplicável a todas as rotas `/gestao/*` (Dashboard, Agenda, Pacientes, Contratos, Financeiro, Configurações, etc.). O site público continua em modo claro — o toggle é exclusivo do painel.

## Implementação

### 1. ThemeProvider
Criar `src/components/gestao/ThemeProvider.tsx`:
- Contexto `theme` com valores `light` | `dark` | `system`.
- Persiste em `localStorage` (`gestao-theme`).
- Aplica classe `.dark` em `<html>`.
- Respeita `prefers-color-scheme` quando `system`.
- Evita flash inicial via inline script lendo o localStorage antes do render (em `__root.tsx`).

### 2. Botão no GestaoShell
Em `src/components/gestao/GestaoShell.tsx`:
- Adicionar `ThemeToggle` no rodapé do menu lateral, próximo de "Ver site" / "Sair".
- Ícones `Sun` / `Moon` (lucide), com `DropdownMenu` para escolher Claro / Escuro / Sistema.
- `aria-label="Alternar tema"`.

### 3. Paleta de modo escuro (suave, não puro)
Já existe `.dark` em `src/styles.css` com tons azulados frios. Vou ajustar para **cinza-quente, baixo contraste, confortável** — evitando preto puro e branco puro que cansam a vista:

```text
--background:        oklch(0.22 0.005 260)   /* cinza-grafite suave */
--foreground:        oklch(0.92 0.005 260)   /* off-white, não branco puro */
--card:              oklch(0.26 0.006 260)   /* leve elevação */
--card-foreground:   oklch(0.92 0.005 260)
--popover:           oklch(0.26 0.006 260)
--muted:             oklch(0.30 0.006 260)
--muted-foreground:  oklch(0.70 0.010 260)
--secondary:         oklch(0.30 0.006 260)
--accent:            oklch(0.32 0.008 260)
--border:            oklch(1 0 0 / 8%)
--input:             oklch(1 0 0 / 12%)
--sidebar:           oklch(0.20 0.005 260)
--sidebar-accent:    oklch(0.28 0.007 260)
--brand:             oklch(0.72 0.13 53)     /* laranja levemente mais claro p/ contraste AA */
--destructive:       oklch(0.65 0.18 22)
--ring:              oklch(0.55 0.02 260)
```

Princípios: luminosidade do `background` ~0.22 (não 0.13), foreground ~0.92 (não 0.98), reduzindo contraste extremo. Tons levemente quentes (chroma baixo no eixo azul) para reduzir fadiga visual.

### 4. Ajustes pontuais
- Auditar cores hardcoded (`bg-white`, `text-black`, `text-gray-*`) em componentes-chave do gestão (Dashboard cards, Agenda, FinanceiroPage, headers de seção) e trocar por tokens semânticos (`bg-card`, `text-foreground`, `text-muted-foreground`).
- Sombras: aumentar opacidade levemente em dark via classe condicional onde necessário.

### 5. Escopo do toggle
- Só ativa `.dark` enquanto o usuário estiver em rotas `/gestao/*`. Ao navegar para o site público, removemos a classe automaticamente (efeito no `GestaoShell` mount/unmount, com cleanup).

## Verificação
- Capturar screenshots via Playwright em Dashboard, Agenda, Pacientes (lista), Financeiro, Configurações nos dois temas.
- Conferir contraste mínimo AA em texto sobre cards.
- Garantir que o site público (`/`) permaneça claro independente da escolha.
