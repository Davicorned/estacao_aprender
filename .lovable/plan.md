# Plano: Adiar integração MCP

## Contexto
- O usuário optou por **cancelar/adiar** a ativação do servidor MCP.
- O app roda sobre um **Supabase próprio** (`iscgrqldjytzhhvtgcmy.supabase.co`), e o servidor MCP com OAuth 2.1 exige que o **OAuth 2.1 Authorization Server** esteja ativado nesse Supabase — não é algo que eu possa ativar automaticamente.

## Decisão
**Não implementar o servidor MCP agora** e manter o app inalterado.

## Ações deste plano
1. Não realizar nenhuma alteração de código neste turno.
2. Preservar a arquitetura atual (site público, blog, painel de gestão) como está.
3. Registrar o pré-requisito para retomada futura: habilitar o OAuth 2.1 no Supabase (Authentication → OAuth 2.1 / Dynamic Client Registration) antes de instalar `@lovable.dev/mcp-js`.

## Próximo passo
Quando o OAuth 2.1 estiver ativado no Supabase, informar para prosseguir com a instalação do MCP, rota de consentimento (`/.lovable/oauth/consent`) e exposição das ferramentas.