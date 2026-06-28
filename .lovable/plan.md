## Problemas atuais (vistos no print)

1. **Coluna do formulário muito estreita** — rótulos quebram ("Etiqueta (laranja, em / cima do título)"), inputs ficam apertados, validação ocupa duas linhas.
2. **Prévia mostra só os avisos** — quando faltam dados a área fica preta/vazia, então você não sabe como o bloco vai ficar nem onde ele entra na Home.
3. **Sem contexto da Home** — a prévia mostra a seção isolada, não dá pra ver que ela vai aparecer entre o banner e a equipe, nem em que posição.
4. **Tudo num único formulão rolável** — Conteúdo, Imagem, Botão, Cards e Aparência misturados.

## O que vou mudar

### 1. Reorganizar o diálogo em 2 colunas equilibradas + abas

```
┌─────────────────────────┬──────────────────────────────┐
│  [Conteúdo] [Mídia]     │  Prévia em tempo real        │
│  [Botão]   [Aparência]  │  ┌──────────────────────┐    │
│                         │  │ [Desktop] [Mobile]   │    │
│  título                 │  │                      │    │
│  descrição              │  │   ← seção aqui →     │    │
│  …                      │  │                      │    │
│                         │  └──────────────────────┘    │
│  ⓘ Aparecerá na posição │  Aparecerá entre:            │
│     3 de 5, entre       │  ▸ Banner principal          │
│     "Banner" e "Equipe" │  ▸ Próxima: Nossa equipe     │
└─────────────────────────┴──────────────────────────────┘
```

- Largura do diálogo aumenta para `sm:max-w-6xl`, colunas `[1.1fr_1.4fr]`.
- Abas substituem a rolagem gigante: **Conteúdo** (etiqueta, título, descrição, parágrafo extra), **Mídia** (imagem), **Botão** (texto + link), **Cards** (só aparece em grade-cards), **Aparência** (fundo + visível no site).
- Cada aba mostra um badge vermelho com a contagem de erros daquela aba — você vê de longe onde corrigir.

### 2. Prévia que nunca fica vazia

- Quando o campo está vazio, a prévia mostra um **placeholder fantasma** com a forma certa: retângulo tracejado "Sua imagem aqui", linha cinza "Seu título aqui", duas linhas "Sua descrição aqui". Assim você sempre vê o layout do modelo escolhido, mesmo antes de preencher.
- Toggle **Desktop / Mobile** no topo da prévia, mudando a largura simulada (1280 / 390 px) com o mesmo escalonamento atual.
- Prévia fica **sticky** no topo da coluna direita, então rolar o formulário não esconde o resultado.

### 3. Contexto da Home

Abaixo da prévia da seção, um mini-mapa da Home mostrando a ordem real das seções (já temos `items` carregados):

```
Banner principal
─────────────────
Nossa abordagem         ← outras seções
─────────────────
► Esta seção (#3)       ← destacada
─────────────────
Quando procurar ajuda
─────────────────
Nossa equipe
Depoimentos
Rodapé
```

Cada item é clicável: ao clicar, abre direto o editor daquela seção. Isso responde "como vai aparecer na home" sem precisar sair da página.

Botão extra **"Abrir Home em nova aba"** no rodapé do diálogo para ver no site real após salvar.

### 4. Listagem da página (fora do diálogo)

- Cada card de seção ganha:
  - Número de posição grande à esquerda (#1, #2…)
  - Miniatura maior (96×64) com o tipo do modelo sobreposto
  - Linha de status: ✓ Pronta · ⚠ 2 avisos · ✕ 1 erro (revalidando com a mesma `computeBlockingErrors`)
- Botão **"Pré-visualizar a Home completa"** no topo da página, abrindo `/` numa nova aba.
- Texto explicativo curto no topo: "As seções abaixo aparecem na Home, na ordem listada, entre o banner e a equipe."

### 5. Detalhes técnicos (resumido)

- Arquivo único editado: `src/components/gestao/site/SecoesManager.tsx`.
- Componente de placeholder/fantasma novo dentro do mesmo arquivo, sem dependências.
- Reuso de `computeBlockingErrors` + a derivação `fieldIssues` que já existem; apenas redistribui em `Tabs` (shadcn `@/components/ui/tabs`).
- Sem mudança em `DynamicSection.tsx`, banco de dados, RLS ou rotas.

## Fora do escopo

- Editor visual drag-and-drop na própria Home.
- Salvar rascunho/versionamento de seções.
- Novos modelos de seção (mantemos os 3 atuais).

Confirma que sigo nessa direção?
