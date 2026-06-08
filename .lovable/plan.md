## Dois problemas, duas correções

### 1. Erro "Could not find column 'arquivo_assinado_mime'"
O SQL da Fase 7 (colunas do anexo assinado + bucket) não chegou a rodar no Supabase — a tabela `contratos` ainda não tem as 3 colunas novas.

**Você roda este trecho no SQL Editor do Supabase:**

```sql
-- Colunas para o contrato assinado (scan)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS arquivo_assinado_path        text,
  ADD COLUMN IF NOT EXISTS arquivo_assinado_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS arquivo_assinado_mime        text;

-- Bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('contratos-assinados', 'contratos-assinados', false)
ON CONFLICT (id) DO NOTHING;

-- Policies do bucket (somente authenticated)
DROP POLICY IF EXISTS "contratos_assinados_select" ON storage.objects;
DROP POLICY IF EXISTS "contratos_assinados_insert" ON storage.objects;
DROP POLICY IF EXISTS "contratos_assinados_update" ON storage.objects;
DROP POLICY IF EXISTS "contratos_assinados_delete" ON storage.objects;

CREATE POLICY "contratos_assinados_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'contratos-assinados');
CREATE POLICY "contratos_assinados_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contratos-assinados');
CREATE POLICY "contratos_assinados_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'contratos-assinados');
CREATE POLICY "contratos_assinados_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'contratos-assinados');
```

Depois disso, o "Anexar contrato assinado" para de dar erro.

### 2. PDF/preview mostrando `{{NOME_PACIENTE}}`, `{{VALOR}}` etc.
O template só era aplicado quando o usuário clicava em **"Reaplicar template"** dentro do form. Como o contrato foi salvo sem clicar, ficou com os placeholders crus — e o PDF/preview/WhatsApp apenas mostram o `termos` salvo.

**Correção no código** (`src/components/gestao/contratos/ContratoFormDialog.tsx`):
- No `handleSubmit`, antes de salvar: se `termos` ainda contém `{{...}}` **ou** é igual ao `TEMPLATE_PADRAO`, aplicar `aplicarTemplate` automaticamente com as variáveis atuais (paciente, serviço, valor, frequência, datas, qtd).
- Resultado: contratos novos já saem com texto pronto. Quem editou manualmente os termos continua tendo a versão própria preservada.

**Contrato existente (Paciente Teste E2E):** abrir o contrato → clicar **"Editar"** → clicar **"Reaplicar template"** → **Salvar**. O PDF passa a sair correto.

---

## Arquivos
- **SQL no Supabase** (você roda): bloco acima.
- **Edit** `src/components/gestao/contratos/ContratoFormDialog.tsx`: auto-aplicar template no submit quando o texto ainda tem placeholders.

## Testes
1. Rodar SQL → anexar PDF assinado funciona.
2. Criar contrato novo sem mexer nos termos → "Baixar PDF" sai com valores reais.
3. Reabrir o contrato existente, "Reaplicar template", salvar → PDF correto.

Posso implementar?
