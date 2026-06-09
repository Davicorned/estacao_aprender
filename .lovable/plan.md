# Esclarecer "1º dia" na recorrência 2x por semana

## Problema
Hoje o bloco mostra só "2º dia da semana", sem deixar explícito que o 1º dia é o dia da semana da **Data** preenchida acima. O usuário precisa adivinhar.

## Mudança proposta (somente UI)
No bloco Recorrência, quando "Frequência = 2x por semana":

- Renomear `2º dia da semana` para **`2º dia da semana (1º = Segunda)`** — o texto entre parênteses é dinâmico e mostra o dia da semana derivado da Data escolhida (ex.: "1º = Segunda", "1º = Terça").
- Adicionar uma linha de ajuda abaixo dos selects:
  > As sessões serão criadas em **Segunda** (a partir de 08/06/2026) e **Quinta**.
- No texto-resumo já existente ("Termina em N sessões — última em …"), manter como está.

Sem mudanças de lógica/dados — apenas labels e uma frase de ajuda.

## Arquivo
- `src/components/gestao/agenda/AgendamentoFormDialog.tsx` — atualizar o `<Label>` do 2º dia e adicionar a linha de ajuda quando `recTipo === "duas_por_semana"`.
