## Duas adições

### 1. KPI "Pacientes remarcados" no Dashboard

Mostrar, no período selecionado, **quantos pacientes distintos tiveram pelo menos um agendamento remarcado** (data ou horário alterado pelo usuário — não confundir com mudança de status).

**Como detectar remarcação:**
- Toda vez que `updateAgendamento` alterar `data`, `hora_inicio` ou `hora_fim`, registramos um evento no histórico (ver item 2).
- O KPI conta pacientes distintos com pelo menos 1 evento `tipo='remarcacao'` no período.

**Novo card no `DashboardPage`:** "Pacientes remarcados" com número + comparativo vs período anterior, ao lado dos outros KPIs.

### 2. Histórico do paciente (timeline)

Nova aba **"Histórico"** dentro da página do paciente (`/gestao/pacientes/$id`), inspirada no print enviado: linha do tempo com ícone + descrição + autor + timestamp.

**Eventos registrados automaticamente:**
- `paciente_criado` — quando o cadastro é criado
- `paciente_editado` — quando dados pessoais mudam (campos relevantes)
- `agendamento_criado` — novo agendamento (mostra data/hora/profissional/serviço)
- `agendamento_remarcado` — data ou hora alterada (mostra "de X para Y")
- `agendamento_cancelado` — com motivo se houver
- `agendamento_atendido` / `faltou`
- `contrato_criado` / `contrato_finalizado`
- `evolucao_registrada` — nova evolução clínica
- `lancamento_pago` — pagamento registrado
- `comentario` — botão "+ Comentário" no topo, autor = usuário logado

**Filtro:** "Todos" / "Agendamentos" / "Financeiro" / "Clínico" / "Comentários".

### Detalhes técnicos

**Nova tabela `paciente_historico`** (migration nova):
```
id uuid pk
paciente_id uuid → pacientes(id) on delete cascade
tipo text  -- 'agendamento_criado'|'agendamento_remarcado'|... 'comentario'
descricao text  -- texto livre/renderizado
metadata jsonb  -- {de:{data,hora}, para:{data,hora}, agendamento_id, etc}
autor_id uuid null (auth.users)
autor_nome text null  -- snapshot
created_at timestamptz default now()

index (paciente_id, created_at desc)
```
GRANTs + RLS: `authenticated` SELECT/INSERT, service_role ALL.

**Helper `src/lib/historico.ts`:**
- `listHistorico(pacienteId, filtro?)`
- `registrarEvento(pacienteId, tipo, descricao, metadata?)` — pega `auth.user` e nome do profissional.
- `registrarComentario(pacienteId, texto)`

**Instrumentação (chamadas a `registrarEvento`):**
- `src/lib/agendamentos.ts`
  - `createAgendamento` / `createAgendamentosLote` → `agendamento_criado`
  - `updateAgendamento` → se `data/hora_inicio/hora_fim` mudaram → `agendamento_remarcado` com `{de, para}`
  - `updateStatus` → `agendamento_cancelado` / `_atendido` / `_faltou`
- `src/lib/pacientes.ts` → `createPaciente` / `updatePaciente`
- `src/lib/contratos.ts` → criação/finalização
- `src/lib/evolucoes.ts` → nova evolução
- `src/lib/financeiro.ts` → registrar pagamento

Para detectar diff em `updateAgendamento`, ler o registro anterior antes do update (já temos `getAgendamento`).

**UI — novo componente `HistoricoTab.tsx`** (em `src/components/gestao/pacientes/` ou `prontuario/`):
- Timeline vertical com linha + bolinhas coloridas por categoria (verde=agendamento, azul=clínico, amarelo=financeiro, cinza=comentário).
- Cards com ícone, descrição, autor + timestamp.
- Botão "+ Comentário" abre dialog simples (textarea + salvar).
- Filtro "Todos ▾" no topo direito.
- Adicionar como nova aba em `ProntuarioTab` ou na página do paciente.

**Dashboard — `src/lib/dashboard.ts`:**
- Nova função `pacientesRemarcadosNoPeriodo(range, profissionalId?)`: conta `count distinct paciente_id` em `paciente_historico` onde `tipo='agendamento_remarcado'` e `created_at` no range. Se `profissionalId` fornecido, faz join com agendamentos via `metadata->>agendamento_id`.
- Incluir no `fetchKpis` retornando `pacientes_remarcados` + variação.
- `DashboardPage`: novo `StatCard` "Pacientes remarcados" com ícone `RefreshCw`.

### Arquivos a criar/editar

**Criar:**
- `supabase/migrations/20260611100000_paciente_historico.sql`
- `src/lib/historico.ts`
- `src/components/gestao/pacientes/HistoricoTab.tsx`
- `src/components/gestao/pacientes/ComentarioDialog.tsx`

**Editar:**
- `src/lib/agendamentos.ts` (instrumentar create/update/status)
- `src/lib/pacientes.ts` (create/update)
- `src/lib/contratos.ts`, `src/lib/evolucoes.ts`, `src/lib/financeiro.ts`
- `src/lib/dashboard.ts` (KPI remarcados)
- `src/components/gestao/dashboard/DashboardPage.tsx` (novo card)
- `src/components/gestao/pacientes/PacienteForm.tsx` ou `prontuario/ProntuarioTab.tsx` (nova aba "Histórico")

### Fora do escopo

- Não vamos retroagir histórico para agendamentos antigos (só registra do momento da implementação em diante).
- Sem edição/exclusão de comentários nesta versão.
- Sem export/PDF do histórico.
