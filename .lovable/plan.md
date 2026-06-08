## Fase 4 — Prontuário Eletrônico

Integrar prontuário à ficha do paciente em `/gestao/pacientes/:id`, com tabs **Dados**, **Prontuário** e **Histórico de Sessões**.

### 1. Banco (nova seção 8 em `SUPABASE_SETUP.md`)

Tabela `public.evolucoes`:
- `id uuid pk`, `paciente_id uuid → pacientes`, `profissional_id uuid → team_members`
- `agendamento_id uuid → agendamentos null` (vínculo opcional, `on delete set null`)
- `data_sessao date not null`
- `queixa text`, `observacao text`, `evolucao text`, `instrumentos text`, `plano text`, `encaminhamentos text`
- `privado boolean default false`
- `created_by uuid → auth.users`, `created_at`, `updated_at` (+ trigger)
- Índices: `(paciente_id, data_sessao desc)`, `(profissional_id)`, `(agendamento_id)`

GRANTs + RLS (auth only, sem `anon`):
- SELECT autenticado: `privado = false OR created_by = auth.uid() OR has_role(auth.uid(),'admin')`
- INSERT autenticado: `created_by = auth.uid()`
- UPDATE/DELETE: `created_by = auth.uid() OR has_role(auth.uid(),'admin')`

### 2. Data layer — `src/lib/evolucoes.ts`

- Tipos `Evolucao`, `EvolucaoInput`
- `listEvolucoes(pacienteId, { profissionalId?, desde?, busca? })` — filtro por período (30d / 3m / 6m / 1a / tudo) e busca via `ilike` em queixa/observacao/evolucao/plano
- `getEvolucao(id)`, `createEvolucao`, `updateEvolucao`, `deleteEvolucao`
- `evolucaoByAgendamento(agendamentoId)` (para tab Histórico)
- `listAgendamentosDoDia(pacienteId, data)` para o select "Vincular a agendamento"
- Default `profissional_id` = team_member do usuário logado (lookup via `team_members.user_id` se existir; senão select manual)

### 3. UI — `src/components/gestao/prontuario/`

- `ProntuarioTab.tsx` — header com nome + idade calculada, botão **Nova Evolução** (gradiente laranja), filtros (profissional, período, busca), lista de `EvolucaoCard`s
- `EvolucaoCard.tsx` — colapsado mostra data • profissional • especialidade + preview da evolução; expandido mostra Queixa / Observação / Evolução / Instrumentos / Plano / Encaminhamentos + botões **Editar** / **Imprimir** (esta imprime só a evolução)
- `EvolucaoFormDialog.tsx` — modal com todos os campos descritos, select de agendamento do dia, checkbox **Privado**, validações, salvar/cancelar
- `HistoricoSessoesTab.tsx` — tabela de agendamentos do paciente (passados + futuros) com filtros por status e período; coluna Evolução com ✓ ou botão **Registrar** que abre o form pré-preenchido
- `PrintProntuario.tsx` — rota/print view com `@media print`: header (logo Estação Aprender + dados do paciente + "CONFIDENCIAL"), todas as evoluções não-privadas (ou só do user logado), footer "Documento confidencial — Estação Aprender"

### 4. Integração na ficha

Refatorar `src/routes/gestao.pacientes.$id.tsx` para usar `Tabs` (shadcn):
- **Dados** → `PacienteForm` atual
- **Prontuário** → `ProntuarioTab`
- **Histórico de Sessões** → `HistoricoSessoesTab`

Botão **Imprimir prontuário** dentro da tab Prontuário abre `/gestao/pacientes/$id/prontuario/imprimir` em nova janela (rota com layout limpo para `window.print()`).

### 5. Integração com Fase 3

No `AgendamentoDetalhesDialog`, ao mudar status para **atendido**, o prompt "Deseja registrar a evolução?" agora navega para a ficha do paciente abrindo o `EvolucaoFormDialog` com `agendamento_id` pré-vinculado.

### Fora de escopo
- Editor rico (usar `Textarea` simples — pode ser trocado depois)
- Exportação PDF server-side (impressão usa `window.print()`)
- Notificações

### Ação necessária após implementação
Rodar a **seção 8** do `SUPABASE_SETUP.md` no SQL Editor para criar a tabela `evolucoes` com RLS.
