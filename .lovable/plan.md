# Fase 7 — PDF do Contrato + Anexo Assinado

Duas funcionalidades complementares no módulo de Contratos:

1. **Baixar contrato em PDF** (gerado do próprio sistema, para imprimir/assinar).
2. **Anexar o contrato assinado** (PDF/JPG/PNG do scan presencial).

---

## 1. Baixar contrato em PDF

- Botão **"Baixar PDF"** em `ContratoView.tsx` (ao lado de Imprimir / WhatsApp).
- Geração client-side com **jsPDF** (`bun add jspdf`).
- Conteúdo: o mesmo texto de `contrato.termos` já renderizado, com margens A4 (20mm), fonte serif, quebra automática de páginas.
- Nome do arquivo: `Contrato-{NomePaciente}-{DataInicio}.pdf`.
- Cabeçalho discreto com nome da clínica + data de geração no rodapé.

## 2. Anexar contrato assinado (scan)

### Schema (migration)
- Novo bucket privado `contratos-assinados` (via `supabase--storage_create_bucket`, public=false).
- Novas colunas em `contratos`:
  - `arquivo_assinado_path text` (caminho no bucket; `null` = sem anexo)
  - `arquivo_assinado_uploaded_at timestamptz`
  - `arquivo_assinado_mime text`
- RLS policies em `storage.objects` para o bucket: SELECT/INSERT/UPDATE/DELETE somente para `authenticated`.

### Defaults assumidos (posso ajustar se preferir)
- **Aceitar PDF, JPG e PNG** (~10 MB máx).
- **1 arquivo por contrato** (substituível, sem histórico de versões).
- **Sem mudança automática de status** — quem decide promover `rascunho` → `ativo` continua sendo o usuário (evita efeito colateral indesejado).

### UI

**Em `ContratoView.tsx`:**
- Bloco "Contrato assinado" abaixo dos botões de ação:
  - Sem anexo → botão **"Anexar contrato assinado"** (abre input file).
  - Com anexo → linha com ícone do tipo de arquivo + data do upload + botões **"Ver assinado"** (abre signed URL nova aba) e **"Substituir"**.
- Upload via `supabase.storage.from('contratos-assinados').upload(path, file, { upsert: true })`, path = `{contrato_id}/{timestamp}-{filename}`. Atualiza colunas em `contratos`.
- Validação client-side: mime in `[application/pdf, image/jpeg, image/png]`, size ≤ 10 MB, com `toast.error` em caso de falha.

**Em `ContratosPage.tsx` (lista):**
- Nova coluna pequena (ícone de clipe 📎) — preenchido se `arquivo_assinado_path` não-nulo, vazio caso contrário, com tooltip "Contrato assinado anexado em DD/MM/AAAA".

### Helpers (em `src/lib/contratos.ts`)
- `uploadContratoAssinado(contratoId, file): Promise<void>` — faz upload, gera path único, faz `updateContrato` setando as 3 colunas novas, deleta arquivo anterior se houver.
- `getContratoAssinadoUrl(path): Promise<string>` — gera signed URL (expira em 1h).
- `removeContratoAssinado(contratoId): Promise<void>` — remove do storage + zera colunas.

---

## Arquivos
- **Migration** nova: colunas em `contratos` + grants.
- **Bucket** novo via tool: `contratos-assinados` (privado) + policies.
- **Edit** `src/lib/contratos.ts`: 3 helpers novos + tipo `Contrato` com as 3 colunas.
- **Edit** `src/components/gestao/contratos/ContratoView.tsx`: botão "Baixar PDF" + bloco "Contrato assinado".
- **Edit** `src/components/gestao/contratos/ContratosPage.tsx`: coluna 📎.
- **Dep**: `bun add jspdf`.

## Testes manuais
1. Abrir um contrato → "Baixar PDF" → arquivo abre com termos completos e nome correto.
2. Anexar PDF assinado → aparece data do upload + botão "Ver" → signed URL abre o arquivo.
3. Substituir → arquivo antigo some do bucket; novo aparece.
4. Lista de contratos: 📎 aparece nos contratos com anexo.
5. Validações: tentar subir .docx ou arquivo > 10MB → toast de erro.

## Confirmação rápida antes de implementar
Os defaults acima (PDF+JPG+PNG, 10MB, 1 arquivo substituível, sem mudar status) estão OK? Se sim, é só dizer "implementar" — se quiser ajustar algum, me avise.
