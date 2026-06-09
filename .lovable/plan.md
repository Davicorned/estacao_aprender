## Novo fluxo do "Novo Agendamento"

Inverter a ordem: a escolha de **recorrência vem antes da data**, e a quantidade de sessões determina automaticamente a frequência.

### Etapas do formulário (nova ordem)

1. **Paciente** (igual hoje, mantém card de contrato vigente)
2. **Profissional + Serviço**
3. **Tipo de agendamento** — toggle:
   - **Sessão única** (não recorrente)
   - **Pacote recorrente**
4. **Bloco condicional:**

   **Se "Sessão única":**
   - Campo `Data` + `Horário de início` (duração vem do serviço)

   **Se "Pacote recorrente":**
   - `Quantidade de sessões` (default 4; opções rápidas: 4, 8, 12, 16 + livre)
   - Frequência **derivada automaticamente** da quantidade:
     - múltiplo de 4 e não-múltiplo de 8 → **1x por semana**
     - múltiplo de 8 → **2x por semana**
     - (regra exibida como texto — usuário pode trocar manualmente com um link "alterar frequência" para casos quinzenal/mensal)
   - Se **1x/semana** → `Dia da semana` + `Horário de início` + `Data de início` (próxima ocorrência desse dia)
   - Se **2x/semana** → `1º dia da semana` + `2º dia da semana` + `Horário de início` + `Data de início`
   - Mostra resumo: "8 sessões, terças e quintas às 14:00, de 09/06 a 30/07"

5. **Pré-visualização das ocorrências** (mantém como hoje, com conflitos e toggles)
6. **Observações** + botões salvar

### Detalhes técnicos

**Arquivo único afetado:** `src/components/gestao/agenda/AgendamentoFormDialog.tsx`

- Adicionar estado `modoAgendamento: "unico" | "recorrente"` no topo, antes de `data`.
- Reordenar os blocos JSX: mover bloco "Recorrência" para depois de paciente/profissional/serviço e antes do bloco de data.
- Quando `modoAgendamento === "recorrente"`:
  - `recTipo` deixa de ser exposto diretamente; é derivado de `ocorrencias` via helper `frequenciaDerivada(n)`:
    - `n % 8 === 0` → `"duas_por_semana"`
    - senão → `"semanal"`
  - Adicionar link "alterar frequência" que abre Select com `quinzenal` / `mensal` / forçar `semanal`.
- Substituir o atual campo "Data" único por:
  - Modo único: `Data` + `Hora`
  - Modo recorrente 1x: `Dia da semana` (Select) + `Data de início` (calculada/ajustada para o próximo dia da semana selecionado) + `Hora`
  - Modo recorrente 2x: `1º dia da semana` + `2º dia da semana` + `Data de início` (próximo 1º dia) + `Hora`
- Helper `proximaDataParaDiaSemana(dataRef, diaSemana)` para ajustar a data-base ao dia da semana escolhido.
- `ocorrenciasParaRecorrencia` em `src/lib/agendamentos.ts` já suporta tudo — **sem mudança em lib**.
- Card de contrato vigente: quando o usuário clica "preencher a partir do contrato", também define `modoAgendamento = "recorrente"` e `ocorrencias = contrato.sessoes_restantes`.

### Fora do escopo

- Sem mudança em banco de dados.
- Sem mudança em `src/lib/agendamentos.ts` / `src/lib/contratos.ts`.
- Lógica de conflitos e pré-visualização permanecem inalteradas.
