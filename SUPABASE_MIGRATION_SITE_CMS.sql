-- =============================================================
-- SITE CMS — execute este SQL no SQL Editor do Supabase
-- (cria as tabelas que o admin Layout/Seções precisa + seeds)
-- =============================================================

-- ---------- site_hero (singleton) ----------
CREATE TABLE IF NOT EXISTS public.site_hero (
  id text PRIMARY KEY DEFAULT 'singleton',
  titulo text,
  titulo_destaque text,
  subtitulo text,
  cta_primario_texto text,
  cta_primario_link text,
  cta_secundario_texto text,
  cta_secundario_link text,
  imagem_url text,
  badge_enabled boolean NOT NULL DEFAULT true,
  badge_titulo text,
  badge_subtitulo text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_hero TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_hero TO authenticated;
GRANT ALL ON public.site_hero TO service_role;
ALTER TABLE public.site_hero ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_hero public read" ON public.site_hero;
CREATE POLICY "site_hero public read" ON public.site_hero FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "site_hero admin write" ON public.site_hero;
CREATE POLICY "site_hero admin write" ON public.site_hero FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- site_servicos ----------
CREATE TABLE IF NOT EXISTS public.site_servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  imagem_url text,
  link text,
  "order" integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_servicos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_servicos TO authenticated;
GRANT ALL ON public.site_servicos TO service_role;
ALTER TABLE public.site_servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_servicos public read" ON public.site_servicos;
CREATE POLICY "site_servicos public read" ON public.site_servicos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "site_servicos admin write" ON public.site_servicos;
CREATE POLICY "site_servicos admin write" ON public.site_servicos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- site_rodape (singleton) ----------
CREATE TABLE IF NOT EXISTS public.site_rodape (
  id text PRIMARY KEY DEFAULT 'singleton',
  texto_institucional text,
  telefone text,
  telefone_link text,
  email text,
  endereco_titulo text,
  endereco_texto text,
  copyright text,
  redes_sociais jsonb NOT NULL DEFAULT '[]'::jsonb,
  links_rapidos jsonb NOT NULL DEFAULT '[]'::jsonb,
  links_servicos jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_rodape TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_rodape TO authenticated;
GRANT ALL ON public.site_rodape TO service_role;
ALTER TABLE public.site_rodape ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_rodape public read" ON public.site_rodape;
CREATE POLICY "site_rodape public read" ON public.site_rodape FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "site_rodape admin write" ON public.site_rodape;
CREATE POLICY "site_rodape admin write" ON public.site_rodape FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- site_secoes ----------
CREATE TABLE IF NOT EXISTS public.site_secoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  eyebrow text,
  titulo text,
  descricao text,
  descricao_extra text,
  imagem_url text,
  cta_texto text,
  cta_link text,
  bg_style text DEFAULT 'branco',
  "order" integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_secoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_secoes TO authenticated;
GRANT ALL ON public.site_secoes TO service_role;
ALTER TABLE public.site_secoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_secoes public read" ON public.site_secoes;
CREATE POLICY "site_secoes public read" ON public.site_secoes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "site_secoes admin write" ON public.site_secoes;
CREATE POLICY "site_secoes admin write" ON public.site_secoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- site_secao_itens ----------
CREATE TABLE IF NOT EXISTS public.site_secao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secao_id uuid NOT NULL REFERENCES public.site_secoes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  icone text,
  "order" integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.site_secao_itens TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_secao_itens TO authenticated;
GRANT ALL ON public.site_secao_itens TO service_role;
ALTER TABLE public.site_secao_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_secao_itens public read" ON public.site_secao_itens;
CREATE POLICY "site_secao_itens public read" ON public.site_secao_itens FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "site_secao_itens admin write" ON public.site_secao_itens;
CREATE POLICY "site_secao_itens admin write" ON public.site_secao_itens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- SEEDS (rode apenas uma vez; ON CONFLICT evita duplicação dos singletons)
-- =============================================================

INSERT INTO public.site_hero (id, titulo, titulo_destaque, subtitulo,
  cta_primario_texto, cta_primario_link, cta_secundario_texto, cta_secundario_link,
  imagem_url, badge_enabled, badge_titulo, badge_subtitulo)
VALUES ('singleton',
  'Cuidamos de cada fase de desenvolvimento do', 'seu filho(a)',
  'Equipe multiprofissional especializada no cuidado integral de crianças e adolescentes. Acolhimento, diagnóstico e tratamento personalizados.',
  'Agendar atendimento',
  'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.',
  'Conhecer serviços', '/Servicos',
  'https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png',
  true, '+500 famílias', 'atendidas com sucesso')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_rodape (id, texto_institucional, telefone, telefone_link, email,
  endereco_titulo, endereco_texto, copyright, redes_sociais, links_rapidos, links_servicos)
VALUES ('singleton',
  'Cuidando da saúde emocional de crianças, adolescentes e suas famílias com acolhimento e profissionalismo.',
  '(11) 93213-9815', 'https://wa.me/5511932139815', 'contato@estacaoaprender.com.br',
  'Unidade Engenheiro Goulart', 'Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040',
  '© 2026 Estação Aprender. Todos os direitos reservados.',
  '[{"tipo":"instagram","url":"https://www.instagram.com/espaco.ide/"},{"tipo":"facebook","url":"#"}]'::jsonb,
  '[{"label":"O Espaço","href":"/"},{"label":"Quem Somos","href":"/QuemSomos"},{"label":"Serviços","href":"/Servicos"},{"label":"Atendimento","href":"/Atendimento"}]'::jsonb,
  '[{"label":"Psicoterapia","href":"/Servicos?servico=psicoterapia"},{"label":"Avaliação Neuropsicológica","href":"/Servicos?servico=neuropsicologia"},{"label":"Fonoaudiologia","href":"/Servicos?servico=fonoaudiologia"},{"label":"Psicopedagogia","href":"/Servicos?servico=psicopedagogia"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3 seções iniciais espelhando o que existe hoje na Home
WITH s1 AS (
  INSERT INTO public.site_secoes (tipo, eyebrow, titulo, descricao, cta_texto, cta_link, bg_style, "order", enabled)
  VALUES ('grade-cards', 'Quando buscar ajuda',
    'Sinais de que seu filho pode precisar de apoio',
    'Identificar cedo é essencial. Nossa equipe está pronta para acolher cada família com escuta e cuidado.',
    'Falar com a equipe', 'https://wa.me/5511932139815', 'gradiente', 1, true)
  RETURNING id
)
INSERT INTO public.site_secao_itens (secao_id, titulo, descricao, icone, "order")
SELECT id, t.titulo, t.descricao, t.icone, t.ord FROM s1, (VALUES
  ('Dificuldades escolares', 'Queda no rendimento, recusa em ir à escola.', 'BookOpen', 1),
  ('Mudanças de humor', 'Tristeza, irritabilidade ou ansiedade frequentes.', 'Heart', 2),
  ('Atrasos no desenvolvimento', 'Fala, socialização ou aprendizagem.', 'Brain', 3),
  ('Comportamentos preocupantes', 'Isolamento, agressividade ou medos intensos.', 'TrendingDown', 4)
) AS t(titulo, descricao, icone, ord);

INSERT INTO public.site_secoes (tipo, eyebrow, titulo, descricao, imagem_url, cta_texto, cta_link, bg_style, "order", enabled)
VALUES ('texto-imagem-direita', 'Nossa abordagem',
  'Cuidado integral e personalizado',
  E'Trabalhamos com uma equipe multidisciplinar que olha para cada criança de forma única.\n\nUnimos avaliação criteriosa, plano terapêutico individualizado e parceria com a família.',
  'https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png',
  'Conhecer nossa equipe', '/QuemSomos', 'branco', 2, true);

INSERT INTO public.site_secoes (tipo, eyebrow, titulo, descricao, imagem_url, cta_texto, cta_link, bg_style, "order", enabled)
VALUES ('texto-imagem-esquerda', 'Nossos serviços',
  'Tratamentos para cada necessidade',
  'Psicoterapia, avaliação neuropsicológica, fonoaudiologia e psicopedagogia em um só lugar.',
  'https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/81d826ca8_home.png',
  'Ver todos os serviços', '/Servicos', 'gradiente', 3, true);