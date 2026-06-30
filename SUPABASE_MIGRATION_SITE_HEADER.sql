-- ============================================================
-- Site CMS: Header (Cabeçalho)
-- Execute no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_header (
  id text PRIMARY KEY DEFAULT 'singleton',
  logo_url text,
  mostrar_nome boolean NOT NULL DEFAULT true,
  nome_marca text,
  cta_visivel boolean NOT NULL DEFAULT true,
  cta_label text,
  cta_to text,
  bg_cor text,
  bg_cor_2 text,
  texto_cor text,           -- 'claro' | 'escuro' | null
  cor_destaque text,
  sticky boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_header_singleton CHECK (id = 'singleton')
);

CREATE TABLE IF NOT EXISTS public.site_header_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id text NOT NULL REFERENCES public.site_header(id) ON DELETE CASCADE,
  label text NOT NULL,
  "to" text NOT NULL,
  "order" int NOT NULL DEFAULT 0,
  visivel boolean NOT NULL DEFAULT true
);

GRANT SELECT ON public.site_header TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_header TO authenticated;
GRANT ALL ON public.site_header TO service_role;

GRANT SELECT ON public.site_header_itens TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_header_itens TO authenticated;
GRANT ALL ON public.site_header_itens TO service_role;

ALTER TABLE public.site_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_header_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_header read all" ON public.site_header;
CREATE POLICY "site_header read all" ON public.site_header FOR SELECT USING (true);
DROP POLICY IF EXISTS "site_header write auth" ON public.site_header;
CREATE POLICY "site_header write auth" ON public.site_header FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "site_header_itens read all" ON public.site_header_itens;
CREATE POLICY "site_header_itens read all" ON public.site_header_itens FOR SELECT USING (true);
DROP POLICY IF EXISTS "site_header_itens write auth" ON public.site_header_itens;
CREATE POLICY "site_header_itens write auth" ON public.site_header_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed singleton com defaults atuais
INSERT INTO public.site_header (id, mostrar_nome, nome_marca, cta_visivel, cta_label, cta_to, sticky)
VALUES ('singleton', true, 'Estação Aprender', true, 'Agendar Atendimento', '/Contato', true)
ON CONFLICT (id) DO NOTHING;

-- Seed dos itens de menu, se ainda não existirem
INSERT INTO public.site_header_itens (header_id, label, "to", "order", visivel)
SELECT 'singleton', v.label, v.to, v.ord, true
FROM (VALUES
  ('O Espaço', '/', 0),
  ('Quem Somos', '/QuemSomos', 1),
  ('Serviços', '/Servicos', 2),
  ('Atendimento', '/Atendimento', 3),
  ('Contato', '/Contato', 4)
) AS v(label, "to", ord)
WHERE NOT EXISTS (SELECT 1 FROM public.site_header_itens WHERE header_id = 'singleton');