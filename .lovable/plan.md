## Problema

O `PreviewFrame` monta a árvore React no `<body>` do iframe via portal ANTES dos estilos (Tailwind + fontes) terminarem de ser aplicados. O fluxo hoje é:

1. iframe carrega com `srcDoc` vazio → `onLoad` dispara.
2. Copiamos `<style>` e `<link rel="stylesheet">` do documento pai para o `<head>` do iframe.
3. Imediatamente setamos `mountNode = doc.body`, e o portal renderiza os componentes.
4. Os `<link rel="stylesheet">` clonados ainda estão baixando/aplicando → o conteúdo aparece **sem estilo** por alguns ms (FOUC — flash of unstyled content) e depois "conserta".

Também não ajuda que o `<body>` fique visível desde o primeiro frame, mesmo antes de qualquer conteúdo montar.

## Correção

Ajustar apenas `src/components/gestao/site/PreviewFrame.tsx`:

1. **Esperar os stylesheets carregarem antes de montar o portal.**
   - Ao clonar cada `<link rel="stylesheet">`, coletar uma `Promise` que resolve no `load`/`error` do link clonado (para links inline `<style>` não precisa esperar).
   - Só chamar `setMountNode(doc.body)` depois de `Promise.all(...)` resolver. Com timeout de segurança (~500ms) para nunca travar caso um link nunca dispare load.

2. **Esconder o conteúdo até estar pronto.**
   - Iniciar `doc.body.style.visibility = "hidden"` (ou `opacity: 0` com `transition`) logo no `onLoad`.
   - Ao resolver o passo 1 e no próximo frame (`requestAnimationFrame`), setar `visibility = "visible"`.

3. **Overlay de carregando no wrapper externo** (fallback visual enquanto `mountNode` for `null`): manter o `div` do iframe com fundo `#FEF3E8` (mesmo tom creme da Home) em vez de branco puro, para o "flash" antes do primeiro paint não parecer uma tela quebrada. Simples: trocar `background: #ffffff` do body do iframe e o `bg-white` do wrapper para um tom neutro claro.

4. **Reaproveitar o `<head>` já preparado ao trocar device.**
   - Hoje ao alternar Desktop/Mobile o iframe é recriado (via `key={device}`) e o processo inteiro roda de novo, gerando outro flash.
   - Alternativa: manter o mesmo iframe e apenas atualizar `targetW`/meta viewport + reescalar. Isso elimina o segundo FOUC ao trocar device.

## Validação

- Abrir Layout › Banner (e Cabeçalho/Rodapé): a prévia deve aparecer já estilizada, sem "piscada" de conteúdo sem CSS.
- Alternar Desktop ↔ Mobile não deve reintroduzir o flash.
- Testar em dev (build sem cache) — é onde o FOUC é mais visível.

## Arquivos

- `src/components/gestao/site/PreviewFrame.tsx` (único arquivo alterado)
