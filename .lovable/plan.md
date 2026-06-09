# Repensando a recorrência do Novo Agendamento

## Problema
Hoje o Novo Agendamento oferece "Semanal (4)", "Quinzenal (4)" e "Mensal (3)" — números fixos, sem relação com o contrato. No contrato o pacote é descrito por:
- **Modalidade**: Pacote Mensal / Avulso
- **Aulas por mês**: 4 ou 8 (1x ou 2x por semana)
- **Vigência**: Qtd de sessões + Frequência (Semanal, Quinzenal, Mensal, Livre) + Data início/término

Resultado: o terapeuta precisa "adivinhar" quantas ocorrências criar e o agendamento não conversa com o contrato vigente.

## Proposta — Novo Agendamento orientado ao contrato

### 1. Vincular agendamento a um contrato (opcional)
Após selecionar o paciente, buscar contratos **ativos** dele. Se houver:
- Mostrar bloco "Contrato vigente" com resumo (modalidade, aulas/mês, frequência, sessões restantes).
- **Pré-preencher**: profissional, serviço, frequência, e sugerir nº de ocorrências = sessões restantes do contrato (limitado a 12 para não criar demais de uma vez).
- Marcar os agendamentos criados com `contrato_id` para contagem futura.

Se o paciente não tiver contrato ativo, o fluxo continua como hoje (manual).

### 2. Novo bloco "Recorrência" mais inteligente
Substituir o select único por:

```text
[ ] Repetir agendamento
    Frequência:  ( ) Semanal   ( ) 2x por semana   ( ) Quinzenal   ( ) Mensal   ( ) Livre
    Quantas sessões: [ 8 ]    Até: [ 04/08/2026 ]  (um calcula o outro)
    □ Pular feriados / datas indisponíveis
```

Regras:
- **Semanal**: mesmo dia da semana, +7 dias.
- **2x por semana**: pede um segundo dia da semana (ex.: Ter + Qui) e gera nas duas datas.
- **Quinzenal**: +14 dias.
- **Mensal**: +1 mês (mesma data).
- **Livre**: cria só o agendamento atual (sem recorrência automática).
- "Quantas sessões" e "Até" são sincronizados: alterar um recalcula o outro com base na frequência.

### 3. Pré-visualização das datas
Antes de salvar, mostrar uma lista compacta das datas que serão criadas com badges:
- ✔ ok
- ⚠ conflito (já tem agendamento nesse horário) — opção "pular" ou "ajustar"
- 🎉 feriado (se a opção estiver marcada)

O botão "Confirmar" só cria as sessões marcadas como ok.

### 4. Confirmação coerente com o volume
Trocar o AlertDialog atual ("Serão criados N agendamentos") pela mesma tela de pré-visualização, que já mostra o total real (excluindo conflitos).

## Detalhes técnicos

### `src/lib/agendamentos.ts`
- Estender `Recorrencia`:
  ```ts
  type Recorrencia =
    | { tipo: "nao" }
    | { tipo: "semanal"; ocorrencias: number }
    | { tipo: "duas_por_semana"; ocorrencias: number; segundoDiaSemana: number }
    | { tipo: "quinzenal"; ocorrencias: number }
    | { tipo: "mensal"; ocorrencias: number }
    | { tipo: "livre" };
  ```
- `ocorrenciasParaRecorrencia` recebe o objeto e devolve `string[]` (datas ISO) calculadas dinamicamente.
- `createAgendamentosRecorrentes` aceita `contratoId?: string | null` e grava no campo correspondente.

### Schema
- Adicionar coluna `contrato_id uuid references contratos(id)` em `agendamentos` (nullable). Migration nova; índice por `contrato_id`.
- Sem mudança em `contratos`.

### `src/lib/contratos.ts`
- Helper `listarContratosAtivosPorPaciente(pacienteId)` retornando contratos com `status = 'ativo'` (ou equivalente) com campos: id, modalidade, aulas_por_mes, frequencia, qtd_sessoes, sessoes_realizadas (contagem via agendamentos vinculados).

### `src/components/gestao/agenda/AgendamentoFormDialog.tsx`
- Após `setPaciente`, carregar contratos ativos e exibir card "Contrato vigente" com botão "Usar dados do contrato" (preenche profissional, serviço, frequência, sessões sugeridas).
- Substituir o select de Recorrência pelo novo bloco descrito acima.
- Adicionar componente `PreviewOcorrencias` que lista datas, marca conflitos (usa `checarConflito` em batch) e permite desmarcar.
- `handleSubmit` envia apenas as datas confirmadas + `contrato_id`.

### Itens fora do escopo desta iteração
- Recorrência infinita / regras de exceção tipo Google Calendar.
- Edição em lote de uma série criada (já existe `recorrencia_grupo_id`, basta manter).
- Calendário de feriados nacionais (a opção fica preparada, mas a primeira versão pode usar uma lista local simples ou ficar desabilitada com tooltip "em breve").

## Perguntas antes de implementar
1. Confirma que devo adicionar a coluna `contrato_id` em `agendamentos` para fazer o vínculo? (sem ela, não conseguimos contar sessões realizadas do contrato).
2. "2x por semana" faz sentido como opção própria (ex.: Ter+Qui), ou prefere manter só "Semanal" e o terapeuta cria dois agendamentos separados?
3. A pré-visualização das datas com checkboxes (item 3) é desejável já nessa iteração, ou prefere manter o AlertDialog simples agora e adicionar depois?
