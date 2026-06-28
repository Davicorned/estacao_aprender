## Simplificar ações do dialog "Detalhes do Agendamento"

Reduzir as 6 ações soltas em **2 ações principais (positiva / negativa)** mais **Remarcar** acima, e mover **Editar / Excluir** para uma linha secundária discreta no rodapé.

### Nova hierarquia visual

```text
┌────────────────────────────────────────────┐
│  [ Detalhes do Agendamento ]            ✕  │
│  (dados do agendamento — sem alterações)   │
│                                            │
│  ┌──────────────────┬──────────────────┐   │ ← AÇÃO PRIMÁRIA
│  │  ✓ Atendido      │  ✕ Faltou        │   │   (positiva / negativa,
│  └──────────────────┴──────────────────┘   │    contextual ao status)
│                                            │
│  ┌────────────────────────────────────┐    │ ← AÇÃO SECUNDÁRIA
│  │  🗓  Remarcar                      │    │   (outline largura total)
│  └────────────────────────────────────┘    │
│                                            │
│  ─────────────────────────────────────     │
│  Editar      Excluir              Fechar   │ ← rodapé minimalista
└────────────────────────────────────────────┘
```

### Comportamento contextual das 2 ações principais

A dupla muda conforme o status atual — sempre uma positiva (verde/laranja) e uma negativa (vermelha clara):

| Status atual         | Ação positiva (esquerda)   | Ação negativa (direita)  |
| -------------------- | -------------------------- | ------------------------ |
| `agendado`           | Confirmar                  | Cancelar                 |
| `confirmado`         | Marcar como atendido       | Paciente faltou          |
| `em_atendimento`     | Finalizar atendimento      | Paciente faltou          |
| `atendido`           | — (oculta dupla)           | —                        |
| `cancelado` / `faltou` | — (oculta dupla)         | —                        |

O fluxo "Iniciar atendimento" deixa de existir como botão dedicado — vira parte do mesmo botão "Marcar como atendido" (transição direta `confirmado → atendido`), que é como a clínica realmente trata no fim do dia. Se quiser preservar o passo intermediário, posso manter "Iniciar atendimento" como ação positiva quando o status for `confirmado` em vez de "Atendido" — me diga na implementação.

### Remarcar

Botão único de largura total abaixo da dupla, com ícone de calendário. Reaproveita o handler `onEdit` que já abre o `AgendamentoFormDialog` (lá dentro o usuário muda data/hora).

### Rodapé (Editar / Excluir / Fechar)

- **Editar** — `variant="ghost"`, abre o mesmo dialog de edição (mesmo `onEdit`). Útil para corrigir profissional, serviço, observações sem ser uma "remarcação".
- **Excluir** — `variant="ghost"` em vermelho discreto, mantém o `AlertDialog` de confirmação.
- **Fechar** — `variant="outline"` à direita.

Layout: `flex justify-between` — esquerda agrupa Editar + Excluir; direita fica Fechar.

### Detalhes técnicos

Arquivo único: `src/components/gestao/agenda/AgendamentoDetalhesDialog.tsx`.

- Substituir o grid `grid-cols-2 gap-2` (linhas 158–187) pelo novo bloco com 2 botões primários + 1 secundário, derivados de um helper `acoesPorStatus(status)` que retorna `{ positiva?, negativa? }`.
- Botão positivo: `bg-[#B85A24] text-white hover:bg-[#a04d1e]` (laranja da marca, já usado no app).
- Botão negativo: `variant="outline"` + `text-red-600 border-red-200 hover:bg-red-50`.
- Botão Remarcar: `variant="outline"` largura total, ícone `CalendarClock` de `lucide-react`.
- Reescrever o `DialogFooter` para conter Editar (ghost) + Excluir (ghost vermelho) à esquerda e Fechar à direita.
- Manter intactos: `AlertDialog` de cancelamento (com motivo), `AlertDialog` de exclusão, `AlertDialog` pós-finalização, e toda a lógica de `mudarStatus` / `handleDelete`.
- Nenhuma mudança em `src/lib/agendamentos.ts`, nenhuma migração SQL.
