## Objetivo

Quando o nível de escolaridade for **Educação Infantil**, **Fundamental I**, **Fundamental II** ou **Ensino Médio**, exibir 3 campos extras (opcionais) na seção **Escolaridade** do cadastro do paciente: **Turma**, **Professor(a)** e **Coordenação**. Para **Superior**, **Outro** ou em branco, esses campos ficam ocultos.

## Onde aparece

- **Wizard de cadastro novo** → passo "Escola"
- **Edição do paciente** → aba "Dados Pessoais", seção "Escolaridade"

Os campos são sempre **opcionais** (sem validação obrigatória).

## Mudanças

### 1. Banco de dados
Nova migration adicionando 3 colunas em `pacientes`:
- `escola_turma` (text, nullable) — ex.: "2º A"
- `escola_professor` (text, nullable)
- `escola_coordenacao` (text, nullable)

> Esses 3 campos já existem na tabela `paciente_ficha_clinica` (`escola_turma`, `escola_professor`, `escola_coordenacao`), mas lá fazem parte de um bloco mais amplo de "Escola" da ficha clínica. Vamos **manter ambos** por ora — o cadastro básico usa as novas colunas em `pacientes` (preenchidas pela recepção), e a Ficha Clínica continua com seus próprios campos para histórico clínico. Se você preferir unificar, me avisa.

### 2. Types e helpers (`src/lib/pacientes.ts`)
- Adicionar `escola_turma`, `escola_professor`, `escola_coordenacao` em `Paciente`.

### 3. Formulário (`src/components/gestao/pacientes/PacienteForm.tsx`)
- Adicionar os 3 campos em `FormState`, `blank()`, `fromPaciente()`, `toInput()`.
- Na seção **Escolaridade**, renderizar Turma/Professor/Coordenação **somente** se `escolaridade_nivel` for um dos 4 níveis escolares.
- Layout: campos em grid de 3 colunas abaixo de "Nome da escola".

## Comportamento visual

```
Escolaridade
  [Nível ▾]  [Nome da escola ........................]

  (se nível ∈ {Ed. Infantil, Fund. I, Fund. II, Ensino Médio})
  [Turma]    [Professor(a)]    [Coordenação]
```

Trocar o nível para Superior/Outro **mantém os valores em memória** (não apaga), mas eles deixam de ser exibidos e salvos como null no banco — assim o usuário não perde digitação por engano. *(Se preferir limpar ao trocar de nível, me diz.)*