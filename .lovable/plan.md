
# Validação mobile de todos os previews dos estilos

## Objetivo
Rodar uma varredura automatizada nos previews mobile de **todos os layouts** dos templates de seção que têm variantes visuais, capturar screenshots e listar problemas de responsividade (overflow horizontal, texto cortado, botão apertado, imagem esmagada, cards colados, etc.).

## Escopo — templates com múltiplos layouts hoje

| Template | Layouts |
|---|---|
| `equipe` | grade, carrossel, circulos, lista-perfil, destaque-grade, mosaico |
| `depoimentos` | grade, carrossel, destaque, mosaico, lista, faixa |
| `contato-mapa` | info-mapa, mapa-topo, so-info, cards-grade, faixa, mapa-fundo |
| `cta-banner` | centralizado, dividido, com-imagem, minimalista |
| `modalidades` | (único layout — incluir só como sanity check) |

Total: **~23 previews** a validar em mobile (375px).

## Como validar

1. Usar Playwright headless com viewport `375×1800` (mobile).
2. Renderizar cada layout **isoladamente** — sem depender do usuário abrir seção por seção no admin.
3. Para isso, criar uma rota interna temporária de debug que aceita `?tipo=...&layout=...` e monta uma `SiteSecao` fake, chamando `<DynamicSection>` com dados default do template + coleções mock (team_members, testimonials, servicos). Rota fica sob `/gestao/site/_preview-mobile` ou algo similar, só usada por este teste. **Pode ser removida no fim** — perguntar se quer manter.
4. Script Playwright itera a lista de (tipo, layout), navega, tira screenshot da seção, e detecta:
   - overflow horizontal (`document.documentElement.scrollWidth > innerWidth`)
   - elementos que ultrapassam a viewport
   - botões com altura < 40px ou label truncada de forma indesejada
5. Salvar screenshots em `/tmp/browser/cta-mobile/` e gerar um relatório resumido.

## Entregável
- Lista dos layouts OK vs. layouts com problema, com screenshot de cada um.
- Para cada problema encontrado, descrição curta (ex.: "cards-grade: 4 colunas ficam apertadas < 360px, precisa cair para 2×2").
- **Não** vou corrigir nada neste turno — só reportar. Após sua revisão, você me diz quais quer que eu ajuste.

## Pergunta rápida
Quer que a rota temporária de debug (`/gestao/site/_preview-mobile`) fique no projeto (útil para futuras validações) ou remove no final?
