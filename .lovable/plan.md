## Nova seção "Nossa Equipe" em /Particular

Criar uma nova seção de equipe com cards expansíveis, posicionada entre "Nossa Abordagem" e "Depoimentos" na página `/Particular`. Conforme solicitado, vou **ignorar o campo "Formação"** e usar apenas **especialidades** (tags), título, bio curta e registro (quando houver).

### Arquivos

1. **Criar** `src/components/site/sections/TeamSection.tsx`
   - Header centralizado: eyebrow "Nossa equipe", título "Profissionais especializados para o seu filho", subtítulo.
   - Grid responsivo (1 col mobile → 2 sm → 3 lg, `max-w-5xl`).
   - Anima com `FadeUp` (já usado nas outras seções).
   - Contém o array `equipe` e o sub-componente `TeamCard`.

2. **Criar** `src/components/site/sections/TeamCard.tsx` (ou inline dentro do TeamSection)
   - Estado local `open` (cada card abre/fecha independente).
   - Card fechado: foto (ou avatar com iniciais sobre gradient laranja), barra accent, nome, título, até 3 tags, botão "Ver detalhes" com chevron.
   - Card aberto: revela bio, registro (se houver) e todas as especialidades.
   - Hover: sombra laranja `shadow-[#D67F43]/10` + zoom suave na foto.

3. **Editar** `src/routes/Particular.tsx`
   - Importar `TeamSection` e renderizar entre `<OurApproach />` e `<Testimonials />`.

### Conteúdo (dados da equipe)

Como o usuário só forneceu os dados da Érica e pediu para eu decidir o resto, vou começar **apenas com a Érica** (1 card centralizado com `max-w-sm mx-auto`), usando a foto existente `src/assets/founder-erica.png`. Estrutura preparada para adicionar mais profissionais depois — basta inserir novos objetos no array `equipe`, sem alterar o componente.

Dados da Érica (ignorando "Formação" conforme pedido):
- **Nome:** Érica Cornedi
- **Título:** Fundadora
- **Foto:** `founder-erica.png` (asset já no projeto)
- **Especialidades:** Psicopedagogia, Psicomotricidade, ABA, Alfabetização, Reforço escolar
- **Bio:** "Fundadora da Estação Aprender. Especializada no atendimento de crianças com dificuldades de aprendizagem, transtornos do desenvolvimento e necessidade de olhar diferenciado."
- **Registro:** omitido (não informado)

Quando houver 1 profissional o grid usa `max-w-sm mx-auto`; com 2 → `sm:grid-cols-2 max-w-2xl`; 3 → `lg:grid-cols-3 max-w-5xl`; 4+ → `lg:grid-cols-4 max-w-6xl` (lógica baseada no `length` do array).

### Detalhes técnicos

- Tipagem TS para `TeamMember` (nome, titulo, foto?, especialidades, bio?, registro?).
- Foto importada via `.asset.json` (`src/assets/founder-erica.png.asset.json` → `.url`), padrão do projeto.
- Ícone `ChevronDown` de `lucide-react`.
- Cores hardcoded conforme o prompt (`#D67F43`, `#C4682E`, `#FEF3E8`, `#B85A24`) — mesma paleta já usada no resto do site.
- Sem alterações em `routeTree.gen.ts` nem em outras páginas.

### Próximo passo após implementação

Você poderá me enviar os demais profissionais (nome, título, especialidades, bio) e eu adiciono no array `equipe` — sem mexer no componente.
