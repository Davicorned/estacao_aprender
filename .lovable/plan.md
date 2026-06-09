# Última sessão e Próx. agendamento na lista de Pacientes

## Diagnóstico

Hoje as duas colunas mostram sempre `—` porque estão hardcoded em `src/routes/gestao.pacientes.index.tsx` (linhas 260-261) e no card mobile (linha 301). Não há consulta a `agendamentos`.

## O que vou implementar

### 1. Novo serverFn `getPacientesAgendamentoStats`
Em `src/lib/pacientes.ts` (ou novo `pacientes.functions.ts`), recebe `pacienteIds: string[]` e retorna `Record<id, { ultima_sessao: string|null, proximo_agendamento: string|null }>`.

Lógica (1 query cada, agregada por paciente):
- **ultima_sessao**: maior `data + hora_inicio` em `agendamentos` onde `paciente_id IN (...)` e `status = 'atendido'` e `data <= hoje`.
- **proximo_agendamento**: menor `data + hora_inicio` em `agendamentos` onde `paciente_id IN (...)`, `status != 'cancelado'`, e `(data, hora_inicio) >= agora`.

Implementação simples no client: dois `.select("paciente_id, data, hora_inicio").in("paciente_id", ids)` com os filtros acima, ordenados, depois reduzidos em JS para pegar o primeiro/último por paciente. Evita N+1 — sempre 2 queries por página (20 pacientes).

### 2. Hook na página
Em `gestao.pacientes.index.tsx`, depois do `useQuery` de pacientes:

```ts
const ids = pacientes.map(p => p.id);
const { data: stats } = useQuery({
  queryKey: ["pacientes-stats", ids],
  queryFn: () => getPacientesAgendamentoStats(ids),
  enabled: ids.length > 0,
});
```

### 3. Renderização
Substituir os `—` por uma função `formatRelativo(date)`:
- hoje → "Hoje"
- ontem / amanhã → "Ontem" / "Amanhã"
- passado: "há N dias", "há N semanas", "há N meses"
- futuro: "em N dias", "em N semanas", "em N meses"
- vazio → `—`

Aplicar tanto na `PacienteRow` (desktop) quanto no `PacienteCard` (mobile, trocando "Último agendamento: —" por duas linhas: última/próxima).

## Detalhes técnicos

- Status usado: `'atendido'` (é o nome real no enum `AgendamentoStatus`, não "realizado").
- "Próximo" inclui `agendado`, `confirmado`, `em_atendimento`, `atendido`, `faltou` — exclui apenas `cancelado`, como você pediu.
- Tudo via `supabase` browser client (RLS já garante o escopo da clínica).
- Sem alterações de schema ou migrations.

## Arquivos

- `src/lib/pacientes.ts` — adicionar `getPacientesAgendamentoStats` + helper `formatRelativo`
- `src/routes/gestao.pacientes.index.tsx` — query de stats e render nas duas colunas (desktop + mobile)
