-- ===========================================================================
-- SUPABASE_MIGRATION_SITE_SECOES_CLEANUP.sql
-- Re-vincula seções órfãs (pagina_id IS NULL) à página Home, evitando seções
-- que não renderizam em lugar nenhum. Rodar uma vez.
-- ===========================================================================

update public.site_secoes
   set pagina_id = (select id from public.site_paginas where slug = 'home' limit 1)
 where pagina_id is null;