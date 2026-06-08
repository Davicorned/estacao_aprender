## Fase 5 — Contratos, Financeiro e Dashboard

### 1. Banco — nova seção 9 em `SUPABASE_SETUP.md`

**`contratos`**
- `id`, `paciente_id → pacientes`, `profissional_id → profissionais`, `servico_id → servicos`
- `valor_centavos int`, `qtd_sessoes int null` (null = indeterminado)
- `frequencia text check in ('semanal','quinzenal','mensal','livre')`
- `data_inicio date`, `data_termino date null`
- `status text check in ('rascunho','ativo','encerrado','cancelado') default 'rascunho'`
- `termos text` (corpo do contrato pós-substituição), `template_origem text null`
- `created_by`, timestamps. GRANTs + RLS (autenticado lê/escreve).

**`lancamentos_financeiros`**
- `id`, `paciente_id`, `contrato_id null`, `agendamento_id null` (unique parcial p/ evitar duplicar do mesmo agendamento)
- `tipo text check in ('receita','despesa') default 'receita'`
- `descricao text`, `valor_centavos int`
- `data_vencimento date`, `data_pagamento date null`
- `status text check in ('pendente','pago','atrasado','cancelado') default 'pendente'`
- `forma_pagamento text null check in ('dinheiro','pix','cartao_credito','cartao_debito','transferencia')`
- `created_by`, timestamps. RLS auth.
- Índices: `(status, data_vencimento)`, `(paciente_id)`, `(agendamento_id) unique where agendamento_id is not null`.

**Trigger automático**: ao um `agendamentos.status` mudar para `'atendido'`, criar (se já não existir) um `lancamentos_financeiros` com:
- contrato ativo do paciente (último por `data_inicio`) se houver → `valor_centavos = contrato.valor_centavos`, `contrato_id = ...`
- senão → `valor_centavos = servico.valor_centavos`
- `descricao = nome do servico + data`, `data_vencimento = data do agendamento`, `status='pendente'`.

**Marcação de atrasados**: SELECT computa `atrasado` dinamicamente (`status='pendente' AND data_vencimento < current_date`) — sem cron. Os cards e badges usam essa lógica derivada para evitar depender de job.

### 2. Data layer

- `src/lib/contratos.ts` — tipos, `listContratos({status,profissionalId})`, `getContrato`, `createContrato`, `updateContrato`, `deleteContrato`, helpers `aplicarTemplate(template, vars)`, `TEMPLATE_PADRAO`, `calcularDataTermino(inicio, qtd, freq)`, `formatBRL`, link `whatsappLink(numero, mensagem)`.
- `src/lib/financeiro.ts` — tipos, `listLancamentos({mes,status,pacienteId,tipo})`, `createLancamento`, `registrarPagamento(id,{data,forma})`, `resumoMes(mes)` (receita_paga, a_receber, atrasados, sessoes_atendidas), `helpers` de status efetivo.
- `src/lib/dashboard.ts` — `kpis({periodo,profissionalId})`, `atendimentosPorDia(range,profId)`, `pacientesNovosVsRecorrentes(range)`, `proximosAgendamentos(limit)`, `proximosLancamentosAReceber(limit)`.

### 3. UI

**`/gestao/contratos`** (`src/components/gestao/contratos/`):
- `ContratosPage.tsx` — tabela + filtros (status, profissional) + botão **Novo Contrato** (gradiente laranja).
- `ContratoFormDialog.tsx` — typeahead paciente (reusa `searchPacientesQuick`), select profissional/serviço, valor (máscara BRL), qtd sessões, frequência, data início/término (auto-calculada se qtd+freq preenchidos), status, textarea grande pré-preenchida com `TEMPLATE_PADRAO` e substituição de variáveis ao abrir/recalcular.
- `ContratoView.tsx` — modal/sheet ou rota separada renderizando o contrato em formato A4 com CSS `@media print`. Botões **Imprimir** (`window.print`) e **Enviar por WhatsApp** (abre `https://wa.me/<numero>?text=<msg>` com mensagem padronizada).

**`/gestao/financeiro`** (`src/components/gestao/financeiro/`):
- `FinanceiroPage.tsx` — 4 cards de resumo (Receita do mês / A receber / Atrasados / Sessões do mês), filtros (mês via seletor, status, paciente typeahead, tipo), tabela com badges coloridos.
- `LancamentoFormDialog.tsx` — criar lançamento manual (tipo, paciente opcional, descrição, valor, vencimento).
- `RegistrarPagamentoDialog.tsx` — data + forma de pagamento; também aceita modo bulk (seleção múltipla na tabela).
- Status atrasado calculado client-side; o badge muda automaticamente.

**`/gestao/dashboard`** (`src/components/gestao/dashboard/`):
- `DashboardPage.tsx` — filtro global (período: 30d/este mês/mês passado/personalizado + profissional).
- **Row 1**: 4 `KpiCard`s com ícone em `bg-[#FEF3E8]`, número, label, e variação % vs período anterior.
- **Row 2**: `AtendimentosLineChart` (recharts, cor `#D67F43`) + `PacientesDonutChart` (recharts, `#D67F43` recorrentes + `#FBCF9E` novos).
- **Row 3**: lista dos próximos 5 agendamentos (hoje/amanhã) com link "Ver agenda completa →".
- **Row 4**: lista dos 5 lançamentos pendentes/atrasados com vermelho para atrasado e link "Ver financeiro completo →".

Recharts já está no `chart.tsx`; não precisa instalar.

### 4. Wiring

- Substituir os placeholders nas rotas `gestao.contratos.tsx`, `gestao.financeiro.tsx`, `gestao.dashboard.tsx` para renderizar os novos page components.

### Fora de escopo
- Cron job de marcar `atrasado` no banco (cálculo derivado é suficiente)
- Exportação PDF server-side (impressão usa `window.print`)
- Geração de boleto/integração de pagamento real

### Ação necessária
Rodar a **seção 9** do `SUPABASE_SETUP.md` (que vou criar) no SQL Editor para criar `contratos`, `lancamentos_financeiros`, e o trigger de geração automática.
