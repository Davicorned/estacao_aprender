ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS responsavel2_nome text,
  ADD COLUMN IF NOT EXISTS responsavel2_parentesco text,
  ADD COLUMN IF NOT EXISTS responsavel2_celular text,
  ADD COLUMN IF NOT EXISTS escolaridade_nivel text,
  ADD COLUMN IF NOT EXISTS escola_nome text;

CREATE TABLE IF NOT EXISTS public.paciente_ficha_clinica (
  paciente_id uuid PRIMARY KEY REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_abertura date,
  especialidades_interesse text[] NOT NULL DEFAULT '{}',
  queixa_inicial text,
  limitacoes text[] NOT NULL DEFAULT '{}',
  limitacoes_outras text,
  alergias text,
  medicacao text,
  diagnosticos text,
  medicos jsonb NOT NULL DEFAULT '[]'::jsonb,
  escola_telefone text,
  escola_turma text,
  escola_professor text,
  escola_coordenacao text,
  escola_observacoes text,
  contato2_nome text,
  contato2_parentesco text,
  contato2_celular text,
  contato2_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paciente_ficha_clinica TO authenticated;
GRANT ALL ON public.paciente_ficha_clinica TO service_role;

ALTER TABLE public.paciente_ficha_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ficha select authenticated"
  ON public.paciente_ficha_clinica FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "ficha insert authenticated"
  ON public.paciente_ficha_clinica FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "ficha update authenticated"
  ON public.paciente_ficha_clinica FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ficha delete authenticated"
  ON public.paciente_ficha_clinica FOR DELETE
  TO authenticated USING (true);
