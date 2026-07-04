## Objetivo

Centralizar todos os contatos do site (telefones, e-mails, endereços) em **uma única tela** no admin. O rodapé, o header, o botão flutuante de WhatsApp, a seção "contato-mapa" e os CTAs de WhatsApp passam a ler dessa central — sem duplicar telefone/email/endereço em cada lugar.

Também acaba a dor de manter `telefone_exibido` e `telefone_link` separados: quem marca o toggle "WhatsApp" tem o link `https://wa.me/...` gerado automaticamente a partir do próprio telefone.

## Modelo de dados (migration)

3 tabelas novas, todas com RLS pública de leitura e grants para `anon`/`authenticated`:

### `site_contato_telefones`
| coluna | tipo | uso |
|---|---|---|
| `id` | uuid pk | |
| `rotulo` | text | "Unidade Gajé", "Comercial" (opcional) |
| `telefone_exibido` | text | "(11) 2621-9800" — o que aparece no site |
| `whatsapp_enabled` | bool | se true, vira também link wa.me |
| `whatsapp_mensagem` | text nullable | mensagem pré-preenchida opcional |
| `usar_no_botao_flutuante` | bool | flag explícita para o WhatsAppFloat |
| `mostrar_no_header` | bool | primeiro telefone com esta flag aparece no header |
| `ordem` | int | |
| `enabled` | bool | |

### `site_contato_emails`
`id`, `rotulo`, `email`, `ordem`, `enabled`.

### `site_contato_enderecos`
`id`, `rotulo` (ex. "Unidade Engenheiro Goulart"), `endereco_texto`, `mapa_embed_url` (opcional), `horarios` (text), `ordem`, `enabled`.

Seed: migra os valores atuais de `site_rodape.telefone/telefone_link/email/endereco_*` para uma linha em cada tabela (idempotente).

## Regras de link WhatsApp

Função utilitária `buildWhatsappLink(telefoneExibido, mensagem?)` no `src/lib/cms.ts`:
- Extrai só dígitos do `telefone_exibido`.
- Se começar com "0", remove.
- Se tiver 10 ou 11 dígitos (BR sem DDI), prefixa `55`.
- Retorna `https://wa.me/{digitos}?text={encoded}` (ou sem `text` se não houver mensagem).

Isso elimina o campo "Telefone (link)" da UI.

## Nova tela: `/gestao/site/contatos`

Um único painel com 3 blocos (Telefones, E-mails, Endereços), cada um com lista + botão "Adicionar" + drag/handles para ordenar. Sub-item de "Admin do site" no menu lateral, acima de "Layout".

Cada linha de telefone tem:
- Input **Telefone exibido** (único campo de número).
- Toggle **É WhatsApp** → quando ligado, mostra campo opcional "Mensagem pré-preenchida" e um preview do link `wa.me/...` gerado.
- Checkbox **Usar no botão flutuante** (só habilitado se WhatsApp estiver ligado; só uma linha por vez — marcar aqui desmarca as outras).
- Checkbox **Mostrar no header**.
- Rótulo, ordem, ativo.

E-mails e Endereços seguem o mesmo padrão (lista simples com rótulo + campo + ativo).

## O que o site passa a consumir

Novo hook `useSiteContatos()` que retorna `{ telefones, emails, enderecos, botaoFlutuante, headerTelefone }`.

| Superfície | Antes | Depois |
|---|---|---|
| `Header` | `rodape.telefone` / `telefone_link` | `headerTelefone` (primeira com `mostrar_no_header`); link auto se `whatsapp_enabled` |
| `Footer` | 1 telefone + 1 email + 1 endereço do rodapé | Lista dos ativos das 3 tabelas |
| `WhatsAppFloat` | URL hardcoded | Telefone com `usar_no_botao_flutuante`; some se não houver |
| `CTABanner` (default) | URL hardcoded | Primeiro telefone com `whatsapp_enabled` |
| `QuickChoiceCards` | URL hardcoded | Idem |
| Seção `contato-mapa` | Campos próprios | Renderiza direto os telefones/emails/endereços da central; os campos próprios da seção são removidos do editor |

Onde ainda faz sentido, cada seção pode ter só um `titulo`/`eyebrow`/`descricao` próprios, mas **não** mais telefone/email/endereço.

## Editor de Rodapé (`/gestao/site/layout/rodape`)

- Remover do editor os campos **Telefone (exibido)**, **Telefone (link)**, **E-mail**, **Endereço — título**, **Endereço — texto**.
- Substituir por um card informativo: "Contatos são gerenciados em **Site → Contatos**" com um link/botão para a nova tela.
- Rodapé continua sendo o lugar de: texto institucional, redes sociais, links rápidos, links de serviços, cores, layout.

## Editor da seção `contato-mapa`

- Remover campos de telefone, email, endereço, horários, mapa_embed_url do formulário da seção.
- Deixar só título/eyebrow/descrição da seção.
- Renderização puxa tudo da central.

## Retrocompatibilidade

- Ler `site_rodape.telefone/email/endereco_*` continua funcionando como fallback caso a central esteja vazia (evita site "quebrado" entre a migration rodar e o usuário conferir).
- Após 1 release, esses campos podem ser removidos do schema — fora deste escopo.

## Migration SQL (arquivo novo)

`SUPABASE_MIGRATION_SITE_CONTATOS.sql`:
- Cria as 3 tabelas + grants + RLS (SELECT público para `anon`/`authenticated`, INSERT/UPDATE/DELETE só `authenticated`).
- Seed idempotente: se todas as tabelas estão vazias, insere 1 linha em cada com os valores atuais de `site_rodape`.

## Arquivos afetados

**Novos:**
- `SUPABASE_MIGRATION_SITE_CONTATOS.sql`
- `src/components/gestao/site/ContatosManager.tsx`
- `src/routes/gestao.site.contatos.tsx`
- `src/lib/cms.ts` — funções `fetchSiteContatos()` e `buildWhatsappLink()`

**Editados:**
- `src/components/gestao/GestaoShell.tsx` — item de menu "Contatos"
- `src/components/gestao/site/RodapeManager.tsx` — remover campos de contato, adicionar aviso
- `src/components/gestao/site/SecoesManager.tsx` — remover campos de contato da seção `contato-mapa`
- `src/components/site/Header.tsx`, `Footer.tsx`, `WhatsAppFloat.tsx`, `CTABanner.tsx`
- `src/components/site/sections/Contact.tsx` — passa a receber lista da central
- `src/components/site/sections/contato/QuickChoiceCards.tsx`
- `src/components/site/sections/dynamic/DynamicSection.tsx` — parar de mapear campos removidos da seção

## Fora de escopo
- Não mexer em redes sociais, links rápidos, cores/layout do rodapé.
- Não criar API pública nem multi-idioma para os contatos.
- Não deletar colunas antigas de `site_rodape` neste release (fallback).
