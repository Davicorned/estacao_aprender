# Admin de conteúdo — /Particular

Construir um painel `/admin` onde **você** (admin único) edita todo o conteúdo da página `/Particular` sem mexer em código. Hoje os textos e imagens estão hardcoded nos componentes; vamos movê-los para o banco e os componentes passam a ler de lá.

## Stack

- **Lovable Cloud** (Supabase gerenciado) — banco, autenticação, storage de imagens.
- **Login único** com email/senha. Você cadastra sua conta uma única vez; novos cadastros desativados.
- **Server functions** do TanStack Start para leitura pública (sem expor service key) e escrita autenticada.

## O que fica editável na /Particular

| Seção | Campos editáveis |
|---|---|
| Hero | Título (com trecho destacado), subtítulo, botão CTA (texto + link/WhatsApp), imagem, badge ("+500 famílias") |
| Quando buscar ajuda | Título, parágrafos, imagem, lista de sinais (ícone + label, adicionar/remover/reordenar) |
| Nossa abordagem | Título, parágrafos, imagem, CTA |
| Nossa equipe | Profissionais: nome, título, foto, especialidades (tags), bio, registro. Adicionar/editar/remover/**reordenar** (drag handle) |
| Depoimentos | Nome, texto, fonte (ex: Google). Adicionar/editar/remover/reordenar |
| Contato | WhatsApp, e-mail, endereço, horários, URL do mapa |
| **Seções** | Ligar/desligar cada seção e reordená-las na página |

Configurações globais: número de WhatsApp e mensagem padrão (usados em vários CTAs).

## Estrutura do /admin

```text
/admin                → redireciona conforme login
/admin/login          → email + senha
/admin (autenticado)  → dashboard com cards das seções
  ├── /admin/hero
  ├── /admin/quando-buscar-ajuda
  ├── /admin/abordagem
  ├── /admin/equipe         (lista + drag-reorder + modal de edição)
  ├── /admin/depoimentos    (lista + drag-reorder + modal de edição)
  ├── /admin/contato
  ├── /admin/secoes         (toggle + reorder de seções da página)
  └── /admin/configuracoes  (WhatsApp, e-mail, etc.)
```

Layout do admin: sidebar fixa + área de edição, separado totalmente do layout público.

## Modelo de dados (Lovable Cloud)

```text
site_settings          (singleton: whatsapp, mensagem padrão, e-mail)
page_sections          (page, section_key, order, enabled)  -- controla ordem/visibilidade
content_blocks         (section_key, data jsonb)            -- conteúdo livre por seção
team_members           (nome, titulo, foto_url, especialidades[], bio, registro, order)
testimonials           (nome, texto, fonte, order)
help_signals           (icon, label, order)                 -- itens de "Quando buscar ajuda"
```

- RLS: leitura pública (`anon` + `authenticated`); escrita só para `authenticated` com papel `admin` (tabela `user_roles` + função `has_role`).
- Storage: bucket público `site-images` para fotos da equipe, hero, etc. Upload pelo admin, render por URL.

## Como o site público passa a ler

- Server fn público `getParticularContent()` retorna todo o conteúdo da página em uma chamada (settings + sections + team + testimonials + signals).
- `Route /Particular` faz `loader` chamando essa server fn, com TanStack Query.
- Cada seção (`Hero`, `TeamSection`, etc.) recebe os dados via props em vez de constantes locais.
- `head()` da rota também consome esses dados (title/description do banco).

## Fluxo de edição

1. Você entra em `/admin/login` → autentica.
2. Edita uma seção → "Salvar" chama server fn autenticada → grava no banco.
3. Página `/Particular` é invalidada e mostra a nova versão na próxima visita (TanStack Query refetch).
4. Upload de imagem: drag-and-drop no formulário → vai para o storage → URL salva no campo.

## Fases de entrega

1. **Cloud + auth + roles** — habilitar Cloud, criar tabela `user_roles`, criar sua conta admin, página de login.
2. **Schema + seed** — criar todas as tabelas, migrar o conteúdo atual (hardcoded) para o banco como seed.
3. **Leitura pública** — server fn + loader + refatorar componentes da /Particular para receber props.
4. **Admin — equipe e depoimentos** — primeiros CRUDs (mais valor imediato), com upload de imagem e drag-reorder.
5. **Admin — Hero / Quando buscar ajuda / Abordagem / Contato** — formulários estruturados de cada seção.
6. **Admin — Seções e Configurações globais** — toggle + reorder de seções, settings (WhatsApp etc.).

Podemos começar pela Fase 1+2+3 num primeiro passo (para já mostrar o conteúdo vindo do banco) e depois fazer o admin em si nas fases seguintes. Confirma que quer seguir assim? Ou prefere que eu já entregue tudo de uma vez?
