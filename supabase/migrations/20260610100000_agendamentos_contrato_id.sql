-- Vincular agendamentos a contratos (opcional) para contagem de sessões
-- e pré-preenchimento da recorrência a partir do contrato vigente.

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS contrato_id uuid
    REFERENCES public.contratos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agendamentos_contrato_id
  ON public.agendamentos(contrato_id);
