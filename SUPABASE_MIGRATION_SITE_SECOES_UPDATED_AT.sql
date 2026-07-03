-- Migration: adicionar updated_at e trigger automático em site_secoes
-- Aplicação: Supabase (PostgreSQL)

-- 1. Adiciona a coluna updated_at (se não existir)
ALTER TABLE public.site_secoes
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Função do trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.set_site_secoes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Cria o trigger (remove se já existir para evitar duplicado)
DROP TRIGGER IF EXISTS trg_site_secoes_updated_at ON public.site_secoes;

CREATE TRIGGER trg_site_secoes_updated_at
BEFORE UPDATE ON public.site_secoes
FOR EACH ROW
EXECUTE FUNCTION public.set_site_secoes_updated_at();

-- 4. Atualiza registros existentes para ter updated_at preenchido
UPDATE public.site_secoes
SET updated_at = created_at
WHERE updated_at IS NULL;

-- 5. Força o PostgREST a recarregar o cache de schema
NOTIFY pgrst, 'reload schema';
