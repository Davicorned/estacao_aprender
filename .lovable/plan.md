## Fase 6 — Financeiro

O módulo global `/gestao/financeiro` já existe (KPIs, lista, filtros, criar lançamento, registrar pagamento — usando a tabela `lancamentos_financeiros`). O que falta para "atendimentos/recebimentos do paciente contabilizarem corretamente no mês" são duas coisas:

1. **Tab Financeiro dentro da ficha do paciente** (hoje é placeholder).
2. **Contabilização automática**: quando um agendamento vira `atendido`, gerar um lançamento de receita vinculado ao paciente + contrato + agendamento, usando o valor do contrato.

---

### 1. Tab Financeiro na ficha do paciente
Arquivo novo: `src/components/gestao/financeiro/FinanceiroPacienteTab.tsx`, plugado em `PacienteForm.tsx` (substitui o placeholder).

Conteúdo:
- **KPIs do paciente no mês selecionado**: Recebido, A receber, Atrasado, Sessões atendidas.
- **Seletor de mês** (default = mês atual).
- **Tabela de lançamentos do paciente** com colunas: Vencimento | Descrição | Valor | Status (badge) | Forma | Ações (registrar pagamento / excluir).
- **Botão "Novo lançamento"** (abre `LancamentoFormDialog` já existente, com `paciente_id` pré-preenchido e travado).
- **Botão "Registrar pagamento"** (abre `RegistrarPagamentoDialog` já existente, escopado aos selecionados).
- Reaproveita `listLancamentos({ pacienteId, mes })` e `resumoMes` (com extensão — ver abaixo).

### 2. Contabilização automática (agendamento atendido → lançamento)
Comportamento: ao mudar status do agendamento para `atendido`, criar um lançamento se ainda não existir um vinculado àquele `agendamento_id`.

Regras:
- Valor: `contratos.valor_centavos` do contrato ativo do paciente+serviço (mais recente com `status='ativo'` e período cobrindo a data). Se não houver contrato, registra com `valor_centavos = 0` e descrição "[Sem contrato] …" para o admin revisar.
- `data_vencimento` = data do agendamento.
- `descricao` = `"Sessão {servico.nome} — {dd/mm/aaaa}"`.
- `tipo='receita'`, `status='pendente'`.
- Idempotente: antes de inserir, verificar `select id from lancamentos_financeiros where agendamento_id = ?` — se existir, não duplica.
- Quando agendamento sai de `atendido` para outro status (faltou/cancelado), o lançamento pendente vinculado é deletado; lançamento já `pago` é preservado (e mostra aviso ao usuário).

Implementação:
- Nova função em `src/lib/financeiro.ts`: `sincronizarLancamentoDeAgendamento(agendamentoId, novoStatus)`.
- Chamada dentro de `src/lib/agendamentos.ts` (no `updateStatusAgendamento` ou equivalente) — ponto único onde o status é alterado.
- Também chamada via botão **"Recontabilizar mês"** no FinanceiroPacienteTab, que itera os atendidos do mês sem lançamento e cria os faltantes (backfill).

### 3. Extensão de helpers
- `resumoMes` ganha parâmetro opcional `pacienteId` para reaproveitamento na tab do paciente.
- `listLancamentos` já aceita `pacienteId` — sem mudanças.

### 4. Privacidade / RLS
Sem alteração de schema. As policies existentes em `lancamentos_financeiros` (somente usuários autenticados da gestão) continuam válidas. Tab nunca aparece no site público.

---

### Arquivos
- **Novo**: `src/components/gestao/financeiro/FinanceiroPacienteTab.tsx`
- **Edit**: `src/components/gestao/pacientes/PacienteForm.tsx` (trocar placeholder)
- **Edit**: `src/lib/financeiro.ts` (add `sincronizarLancamentoDeAgendamento`, `resumoMes(pacienteId)`)
- **Edit**: `src/lib/agendamentos.ts` (chamar sync no update de status)

### Testes manuais após implementação
1. Marcar um agendamento como `atendido` → aparece lançamento pendente no mês, no global e na tab do paciente.
2. Registrar pagamento → KPI "Recebido" sobe; "A receber" cai.
3. Reverter status para `faltou` → lançamento pendente some; lançamento pago permanece.
4. Backfill: rodar "Recontabilizar mês" em paciente com atendidos antigos sem lançamento.

### Pergunta antes de implementar
Confirma que **o valor da sessão deve vir do contrato ativo** (não de uma tabela de preços do serviço)? Se preferir usar `servicos.preco_centavos`, me avise — ajusto o fallback.
