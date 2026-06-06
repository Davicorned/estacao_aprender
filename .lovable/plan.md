## Carrossel horizontal para "Nossa Equipe"

Transformar a seção `TeamSection` em um **carrossel horizontal com peek** (estilo Netflix/streamers), em vez do grid atual. Comportamento desejado:

- Cards lado a lado em uma trilha horizontal com scroll suave.
- **Peek nas pontas**: o card da extremidade aparece "pela metade" para dar a dica visual de que há mais conteúdo para o lado.
- **Setinhas discretas** (chevron esquerda/direita) sobrepostas às bordas, semi-transparentes, com hover mais opaco. Aparecem apenas quando há overflow.
- Swipe nativo no mobile (scroll-snap), setas para desktop.
- Quando houver apenas 1 profissional → mantém o card único centralizado (sem setas, sem peek).

### Implementação

**Editar** `src/components/site/sections/TeamSection.tsx`:

1. Trocar o `grid` por uma trilha `flex overflow-x-auto snap-x snap-mandatory` com `scroll-smooth` e `scrollbar` escondida.
2. Cada `TeamCard` recebe largura responsiva fixa:
   - mobile: `basis-[80%]` (deixa ~20% do próximo aparecendo)
   - sm: `basis-[45%]`
   - lg: `basis-[30%]` (mostra 3 + peek do 4º)
   - `snap-start shrink-0`
3. Padding lateral no container interno (`px-8 lg:px-12`) para o peek funcionar nas duas pontas.
4. Botões de navegação:
   - `<button>` absolutos à esquerda e direita, `top-1/2 -translate-y-1/2`.
   - Estilo: círculo branco translúcido (`bg-white/70 backdrop-blur`), borda sutil, sombra, ícone `ChevronLeft`/`ChevronRight` em `#D67F43`.
   - Hover: `bg-white` opaco.
   - `onClick` faz `scrollBy({ left: ±cardWidth, behavior: "smooth" })` via `useRef`.
   - Setas desabilitam quando atingem o início/fim (listener de scroll atualiza estado `canScrollLeft`/`canScrollRight`).
5. Esconder scrollbar via classe utilitária inline (`[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`).

### Profissionais fictícios (para visualização)

Adicionar **5 profissionais fictícios** ao array `equipe` (total 6 com a Érica), todos com `foto: null` para usar o **avatar de iniciais com gradient laranja** (já implementado no card). Conforme pedido, ignoro "Formação" e uso apenas especialidades + bio curta:

1. **Mariana Lopes** — Psicóloga Infantil — Psicologia infantil, TCC, Avaliação psicológica, Orientação parental — "Atua há 10 anos no acompanhamento emocional de crianças e adolescentes, com foco em ansiedade e regulação emocional."
2. **Camila Ribeiro** — Fonoaudióloga — Fonoaudiologia, Linguagem infantil, Atraso de fala, Comunicação alternativa — "Especialista em desenvolvimento da linguagem e estímulo da comunicação em crianças com atraso de fala e TEA."
3. **Beatriz Alves** — Terapeuta Ocupacional — Terapia Ocupacional, Integração sensorial, Coordenação motora, AVD's — "Trabalha o desenvolvimento da autonomia e da integração sensorial em crianças com necessidades específicas."
4. **Rafael Mendes** — Psicólogo ABA — ABA, TEA, Manejo comportamental, Habilidades sociais — "Foco no atendimento de crianças no espectro autista usando os princípios da Análise do Comportamento Aplicada (ABA)."
5. **Juliana Castro** — Psicopedagoga — Psicopedagogia, Dislexia, TDAH, Reforço escolar, Métodos de estudo — "Apoio a crianças com dificuldades de aprendizagem, com estratégias personalizadas para cada perfil."

(Esses dados são apenas placeholders para visualizar o carrossel — você pode me passar os reais depois e eu substituo.)

### Nota técnica

- Hook simples com `useRef` + `useEffect` para listener de scroll. Sem dependências novas (sem `embla` / `swiper`) — fica leve e suficiente para o caso.
- `FadeUp` continua envolvendo cada card.
- Sem mudanças em `/Particular.tsx` nem em outras páginas.
