## Problema

Hoje só validamos conflito por **profissional** e capacidade de **salas**. Não há validação de conflito por **paciente**, então é possível agendar o mesmo paciente no mesmo horário com profissionais diferentes.

## Solução

Adicionar validação de conflito de horário por paciente (independente do profissional / tipo online ou presencial). Cancelados são ignorados. Em edição, ignora o próprio `id`.

## Mudanças

### 1) `src/lib/agendamentos.ts`
- Nova função `checarConflitoPaciente({ pacienteId, data, horaInicio, horaFim, excludeId? }) → Promise<boolean>` — consulta `agendamentos` filtrando por `paciente_id`, `data`, `status != 'cancelado'` e detecta overlap `inicio < b && fim > a`.
- Nova função `checarConflitosPacienteLote({ pacienteId, datas, horaInicio, horaFim, excludeId? }) → Promise<Set<string>>` (mesmo padrão de `checarConflitosLote`), para uso em recorrência.

### 2) `src/components/gestao/agenda/AgendamentoFormDialog.tsx`
- No submit (criar e editar), antes de `createAgendamento` / `updateAgendamento`, chamar `checarConflitoPaciente` com `pacienteId = paciente!.id` (passando `excludeId` na edição). Se conflito → toast: **"Este paciente já tem um agendamento neste horário."** e aborta.
- No preview de recorrência (onde já roda `checarConflitosLote` e `checarCapacidadeSalasLote`), rodar também `checarConflitosPacienteLote` e unir ao conjunto de datas bloqueadas (mostrando contador tipo "X com conflito de paciente" no rodapé do preview).
- Na criação em lote da recorrência, pular datas que caiam em conflito de paciente da mesma forma que já pula conflitos e falta de sala.

### 3) Sem migration
Regra puramente de aplicação (mesma abordagem já usada para conflito de profissional). Não altera schema.

## Casos de teste
1. Paciente A com Prof. X 09:00–10:00 → agendar Paciente A com Prof. Y 09:30–10:30 → **BLOQUEADO**.
2. Paciente A online + Paciente A presencial no mesmo horário → **BLOQUEADO** (regra é por paciente, tipo irrelevante).
3. Editar o próprio agendamento sem mudar horário → **PERMITIDO** (excludeId).
4. Recorrência: datas com conflito de paciente ficam marcadas no preview e não são criadas.
5. Paciente B em qualquer horário do Paciente A → **PERMITIDO**.
