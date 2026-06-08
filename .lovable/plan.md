## Fase 3 — Sistema de Agendamento

### 1. Schema (SUPABASE_SETUP.md — nova seção 7)

```sql
create type agendamento_status as enum
  ('agendado','confirmado','em_atendimento','atendido','faltou','cancelado');

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(id) on delete restrict,
  servico_id uuid references public.servicos(id) on delete set null,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  tipo text not null default 'presencial' check (tipo in ('presencial','online')),
  status agendamento_status not null default 'agendado',
  observacoes text,
  motivo_cancelamento text,
  recorrencia_grupo_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- índices: (profissional_id, data), (paciente_id, data)
-- grants + RLS authenticated read/write
-- habilitar realtime: alter publication supabase_realtime add table public.agendamentos
```

### 2. Camada de dados — `src/lib/agendamentos.ts`

- Tipos `Agendamento`, `AgendamentoInput`, `Status`.
- `listByRange({ profissionalId?, dataInicio, dataFim })` → busca com join leve em pacientes (nome, foto) e servicos (nome, duracao).
- `getAgendamento(id)`, `createAgendamento(input)`, `createRecorrencia(input, tipo)` → expande para N ocorrências com mesmo `recorrencia_grupo_id`.
- `updateAgendamento(id, patch)`, `updateStatus(id, status, motivo?)`, `deleteAgendamento(id)`.
- `checarConflito({ profissionalId, data, horaInicio, horaFim, excludeId? })`.
- Constantes: `STATUS_STYLES` (cores Tailwind por status), `STATUS_LABEL`, `SLOT_HEIGHT=40`, `SLOT_MIN=15`, `HORA_INICIO='08:00'`, `HORA_FIM='18:00'`.
- Helpers: `mostrarSemana(date)` → array de 7 datas começando no domingo; `slotsDoDia()` → array de strings "HH:MM"; `addMin(time, n)`.

### 3. Realtime
Hook `useAgendamentosRealtime(range)` que assina `postgres_changes` em `public.agendamentos` e invalida o queryKey `["agendamentos", range]`.

### 4. Rotas / componentes

`src/routes/gestao.agenda.tsx` (substitui placeholder).

Componentes em `src/components/gestao/agenda/`:
- `AgendaPage.tsx` — orquestrador (state: data atual, view 'dia'|'semana', profissional selecionado, modais abertos).
- `AgendaHeader.tsx` — navegação ← HOJE →, toggle DIA/SEMANA, Select profissional, botão Novo Agendamento.
- `AgendaSidebar.tsx` — sidebar colapsável (lado esquerdo) listando pacientes do dia (horário + nome + ícone status); clique faz scroll para o slot.
- `SemanaView.tsx` — grid 8 colunas (hora + 7 dias), slots de 15 min × 40px, posicionamento absoluto dos blocos, faixa cinza de almoço lida de `configuracoes_clinica`. Coluna do dia atual recebe borda esquerda azul.
- `DiaView.tsx` — variação 2 colunas (hora + dia único) com blocos mais detalhados (horário + paciente + procedimento + status).
- `AgendamentoBloco.tsx` — bloco posicionado; cor por status; clique abre modal de detalhes.
- `AgendamentoFormDialog.tsx` — modal Novo/Editar:
  - Typeahead de paciente (busca debounce no Supabase) + botão "Cadastrar novo" → abre `/gestao/pacientes/novo` em nova aba.
  - Selects profissional/servico (do `configuracoes`), RadioGroup tipo, Date + horários, hora_fim recalcula ao trocar serviço.
  - Recorrência (Select: Não se repete / Semanal × 4 / Quinzenal × 4 / Mensal × 3) com `AlertDialog` de confirmação "Serão criados X agendamentos".
  - Validações: campos obrigatórios, não passado, checar conflito antes de salvar.
- `AgendamentoDetalhesDialog.tsx` — modal de detalhes com botões de status (Confirmar, Iniciar, Finalizar, Faltou, Cancelar c/ motivo, Remarcar, Editar, Excluir). Ao Finalizar abre prompt "Deseja registrar a evolução no prontuário?" (link para fase 4; por ora só fecha).

### 5. Atualizar lista de pacientes
Coluna "Próx. agendamento" da lista (`gestao.pacientes.index.tsx`) passa a buscar via nova função `proximoAgendamentoPorPaciente(ids[])` agrupada — leve, só para a página atual.

### Itens fora de escopo
- Criação do registro de prontuário ao finalizar (Fase 4).
- Notificações (futuro).

### Ação do usuário
Rodar o bloco SQL da seção 7 do `SUPABASE_SETUP.md` e habilitar Realtime para `public.agendamentos` (já incluído no SQL via `alter publication supabase_realtime add table ...`).
