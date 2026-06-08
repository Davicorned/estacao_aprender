## Problema

O iframe do visualizador carrega `/api/public/file-proxy?url=https%3A%2F%2F...supabase.co%2Fstorage%2F...`. Mesmo sendo um request para o nosso domínio, adblockers e o próprio Chrome inspecionam a query string, encontram `supabase.co/storage` + token assinado e bloqueiam com `ERR_BLOCKED_BY_CLIENT` ("Esta página foi bloqueada pelo Chrome"). Em modo anônimo funciona porque as extensões ficam desativadas.

## Solução

Trocar o formato do proxy para que o navegador nunca veja a URL da Supabase. O cliente passa apenas o **path interno do storage** (ex.: `contratos-assinados/abc/arquivo.pdf`); o servidor gera a signed URL e faz o fetch.

### 1. Nova rota proxy: `src/routes/api/public/file-proxy.$.ts` (splat)

- URL pública vira `/api/public/file-proxy/contratos-assinados/<uuid>/arquivo.pdf` — limpa, sem nada que dispare filtros.
- Handler `GET`:
  - Lê `params._splat` como path no bucket `contratos-assinados`.
  - Valida que o path está dentro do bucket esperado (sem `..`, sem barras iniciais).
  - Usa `supabaseAdmin` (`@/integrations/supabase/client.server`) para `storage.from('contratos-assinados').createSignedUrl(path, 60)`.
  - Faz `fetch` da signed URL no servidor e devolve o body com:
    - `content-type` do upstream
    - `content-disposition: inline` (ou `attachment; filename="..."` se `?download=1`)
    - `cache-control: private, no-store`
    - `x-content-type-options: nosniff`
    - **Sem** repassar headers da Supabase para evitar `X-Frame-Options` restritivo do upstream.
- Deletar a rota antiga `src/routes/api/public/file-proxy.ts`.

### 2. `src/components/gestao/contratos/ContratoView.tsx`

- `handleViewSigned`: setar `viewerUrl = \`/api/public/file-proxy/${localAnexo.path}\`` (sem chamar `getContratoAssinadoUrl`).
- `handleDownloadSigned`: usar `/api/public/file-proxy/${localAnexo.path}?download=1&filename=...`.
- Remover o uso de `getContratoAssinadoUrl` nesses dois handlers (continua existindo na lib para outros usos, se houver).

### 3. Resiliência adicional no viewer

- Adicionar fallback no diálogo: se for PDF, mostrar abaixo do `iframe` um link "Abrir em nova aba" apontando para a mesma rota proxy, útil quando o usuário tem política corporativa que bloqueia PDF embutido.

## Resultado esperado

- A URL que aparece no DevTools e que adblockers inspecionam passa a ser apenas `/api/public/file-proxy/...pdf` no nosso próprio domínio — indistinguível de qualquer outro asset.
- Sem `supabase.co` nem token assinado expostos ao navegador.
- O Chrome para de exibir "Esta página foi bloqueada".
