## Problema
Na aba **Dados Pessoais** (edição do paciente), todas as 8 seções (Foto, Dados pessoais, Responsável, 2º responsável, Escolaridade, Telefones, Endereço, Outros) ficam empilhadas num scroll longo — pesa visualmente e exige rolar muito para chegar nos campos menos usados.

## Solução proposta — Cards retráteis (accordion)

Manter tudo numa única tela (sem criar sub-abas), mas transformar cada seção num **card colapsável** com header clicável, ícone à esquerda e chevron à direita. Igual ao padrão que já usamos na **Ficha Clínica**, garantindo consistência visual.

### Comportamento
- **Abertos por padrão** (sempre que entrar): **Dados pessoais** + **Telefones** → o essencial em mãos.
- **Fechados por padrão**: Responsável, 2º responsável, Escolaridade, Endereço, Outros.
- Header mostra **resumo do conteúdo** quando fechado (ex.: "Responsável: Maria — Mãe" ou "—" se vazio). Ajuda a saber o que está preenchido sem abrir.
- Botões **"Expandir tudo" / "Recolher tudo"** no topo da aba.
- A **foto + nome + idade + status (ativo/inativo)** fica fixa num cabeçalho acima dos cards, sempre visível — funciona como identidade do paciente.

### Layout dos cards
```
┌─ 👤  Dados pessoais ──────────── [▼] ┐
│ Nome | Nasc. | Sexo | CPF | RG | Email │
└──────────────────────────────────────┘

┌─ 📞  Telefones ───────────────── [▼] ┐
│ Celular | Residencial                  │
└──────────────────────────────────────┘

┌─ 👨‍👩‍👧  Responsável  · Maria — Mãe ─ [▶] ┐  ← fechado, com resumo
└──────────────────────────────────────┘
```

## Mudanças

### Arquivo único: `src/components/gestao/pacientes/PacienteForm.tsx`
1. Trocar o helper local `Section` por um novo `CollapsibleSection` (usa `@/components/ui/collapsible` que já existe no projeto) com: ícone, título, resumo opcional, estado aberto, chevron animado.
2. Cabeçalho do paciente acima dos cards: avatar grande + nome + idade + switch "Paciente ativo" (movido pra cá, sai da seção "Outros").
3. Barra de ações no topo da aba: **Expandir tudo · Recolher tudo**.
4. Renderizar as 7 seções como `CollapsibleSection` com `defaultOpen` em Dados pessoais e Telefones; demais começam fechadas.
5. Cada seção recebe uma função `summary()` que retorna o resumo curto a mostrar quando fechada (ex.: telefone formatado, nome+parentesco do responsável, "CEP — Cidade/UF" no endereço, "Fundamental II · Colégio Adventista" na escola, etc.).

### Escopo
- **Apenas o modo edição** (a aba "Dados Pessoais"). O wizard de cadastro novo continua igual (passos já resolvem o problema lá).
- **Sem mudança nos dados** salvos, nas validações, ou no banco — é só apresentação.