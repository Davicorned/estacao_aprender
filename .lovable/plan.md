## Objetivo
Reorganizar a aba **Ficha Clínica** (`FichaClinicaTab.tsx`) com o mesmo padrão visual usado na aba "Dados Pessoais": blocos colapsáveis, com resumos quando recolhidos e ações globais de expandir/recolher.

## Mudanças (apenas UI, sem alterar dados/validação/BD)

### 1. Substituir `Bloco` por `CollapsibleBloco`
Usa `@/components/ui/collapsible` (mesmo componente já usado em PacienteForm).  
Cabeçalho clicável com: título + chevron + resumo curto à direita quando recolhido.

### 2. Estado de abertura por bloco
```
openBlocks: {
  atendimento: true,   // aberto por padrão
  saude: true,         // aberto por padrão
  medicos: false,
  escola: false,
  contato: false,
}
```

### 3. Resumos dinâmicos (quando recolhido)
- **Atendimento**: nº de especialidades selecionadas + 1ª linha da queixa (ex.: "3 especialidades · Dificuldade de fala…")
- **Saúde**: limitações marcadas, ou "Sem limitações" + indicador "Alergias/Medicação" se preenchidos
- **Médicos**: "N profissional(is)" ou "—"
- **Escola**: turma · professor(a) (ex.: "5º ano · Profª Ana")
- **Contato familiar**: nome + parentesco

### 4. Barra de ações
Adicionar ao cabeçalho (junto de "Imprimir" / "Salvar"):
- Botão **Expandir tudo**
- Botão **Recolher tudo**

### 5. Mantido sem alteração
- Toda lógica de estado (`useState ficha`, `update`, `toggleArray`, `setMedico`, etc.)
- Query/mutations (`getFichaClinica`, `upsertFichaClinica`)
- Função `htmlFicha` (impressão)
- Contador "X de Y blocos preenchidos"
- Botão "Salvar ficha" do rodapé

## Arquivos editados
- `src/components/gestao/prontuario/FichaClinicaTab.tsx` (único arquivo)

## Escopo
Somente apresentação. Nenhuma alteração em `src/lib/ficha-clinica.ts`, migrations, ou outros componentes.
