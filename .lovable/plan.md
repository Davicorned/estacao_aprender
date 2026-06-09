## Objetivo

Reduzir trabalho manual no Financeiro:
1. Quando um contrato **pacote_mensal** for ativado, criar automaticamente o **primeiro lançamento pendente** da mensalidade. Próximas mensalidades continuam manuais (botão).
2. Avulso continua como hoje (1 lançamento por sessão atendida).
3. Permitir **editar** o lançamento (valor, vencimento, descrição) e **alterar o status** (pendente / pago / cancelado), além das ações que já existem.

## 1. Geração automática a partir do contrato

**Quando dispara**
- `createContrato` com `status = "ativo"` e `modalidade = "pacote_mensal"`.
- `updateContrato` quando `status` muda para `"ativo"` (ex.: vinha de `rascunho`).

**O que cria**
- 1 lançamento `pendente`, tipo `receita`, vinculado ao `contrato_id` e `paciente_id`.
- `valor_centavos` = `calcularValorMensal(aulas_por_mes, valor_com_desconto_centavos, forma_pagamento)`.
- `data_vencimento` = próximo dia `dia_vencimento` ≥ `data_inicio` (no mês de `data_inicio`, ou no mês seguinte se já passou).
- `descricao` = `"Mensalidade {Serviço} — {mês/ano}"`.
- `forma_pagamento` = a do contrato.
- Idempotente: antes de criar, checa se já existe lançamento com mesmo `contrato_id` e mesmo mês de vencimento.

**Botão "Gerar próxima mensalidade"** (no `ContratoView` e/ou em cada linha de contrato ativo)
- Cria a próxima mensalidade no mês seguinte ao último lançamento já gerado para aquele contrato. Mesma idempotência.

**Registra evento no histórico** do paciente: `lancamento_gerado` ("Mensalidade de {mês} gerada — {valor}").

## 2. Edição e mudança de status no Financeiro

**Reaproveitar `LancamentoFormDialog`** em modo edição:
- Recebe `lancamento` opcional; se vier, faz `update` em vez de `insert`.
- Permite editar `descricao`, `valor_centavos`, `data_vencimento`, `tipo`, `paciente_id`, `forma_pagamento`.

**Novo menu de ações por linha** na tabela `FinanceiroPage` (substitui o lápis-único hoje só lixeira):
- `DropdownMenu` com:
  - Editar (abre o form em modo edição)
  - Marcar como pago (já existe; passa a viver no menu também)
  - Marcar como pendente (`status=pendente`, limpa `data_pagamento`/`forma_pagamento`)
  - Cancelar lançamento (`status=cancelado`)
  - Excluir (lixeira atual)
- Visível também para lançamentos já `pago`/`cancelado` (para reabrir como `pendente`).

**Backend (`src/lib/financeiro.ts`)**
- `updateLancamento(id, patch)` — update genérico.
- `alterarStatusLancamento(id, novoStatus)` — encapsula transições (limpa `data_pagamento` quando volta a pendente; registra evento no histórico).

## 3. Histórico
Eventos novos no `paciente_historico`:
- `lancamento_gerado` (ao criar automático ou via botão).
- `lancamento_status_alterado` (quando muda manualmente — não duplicar com `lancamento_pago` que já existe).

## Fora de escopo
- Geração em lote retroativa de mensalidades antigas.
- Cron/agendamento automático mês a mês (decidimos manual).
- Mudanças no fluxo de avulso (continua via `sincronizarLancamentoDeAgendamento` no atendimento).

## Detalhes técnicos

**Arquivos editados**
- `src/lib/contratos.ts` — após `createContrato`/`updateContrato`, se virou `ativo` e é `pacote_mensal`, chama `gerarMensalidadeContrato(contrato, { primeira: true })`.
- `src/lib/financeiro.ts`:
  - `gerarMensalidadeContrato(contrato, opts)` — calcula vencimento, idempotência, insert.
  - `updateLancamento(id, patch)`.
  - `alterarStatusLancamento(id, novoStatus)`.
- `src/components/gestao/financeiro/LancamentoFormDialog.tsx` — aceitar `lancamento?: Lancamento` para edição.
- `src/components/gestao/financeiro/FinanceiroPage.tsx` — substituir botão lixeira/registrar pagamento isolados por `DropdownMenu` com todas as ações; estado para abrir o form em modo edição.
- `src/components/gestao/contratos/ContratoView.tsx` — botão "Gerar próxima mensalidade" para contratos `pacote_mensal` ativos.

**Sem migração de schema** — usa colunas já existentes em `lancamentos_financeiros`.
