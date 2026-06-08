import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fetchClinica, type ClinicaConfig } from "@/lib/configuracoes";

const blank: ClinicaConfig = {
  id: 1,
  nome: "Estação Aprender",
  telefone: "",
  email: "",
  endereco: "",
  horario_seg_sex_inicio: "08:00",
  horario_seg_sex_fim: "18:00",
  horario_sab_inicio: null,
  horario_sab_fim: null,
  horario_almoco_inicio: "12:00",
  horario_almoco_fim: "13:00",
};

export function ClinicaSection() {
  const [form, setForm] = useState<ClinicaConfig>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetchClinica();
    if (data) setForm({ ...blank, ...data });
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setSaving(true);
    const payload = {
      id: 1,
      nome: form.nome.trim() || "Estação Aprender",
      telefone: form.telefone?.trim() || null,
      email: form.email?.trim() || null,
      endereco: form.endereco?.trim() || null,
      horario_seg_sex_inicio: form.horario_seg_sex_inicio || null,
      horario_seg_sex_fim: form.horario_seg_sex_fim || null,
      horario_sab_inicio: form.horario_sab_inicio || null,
      horario_sab_fim: form.horario_sab_fim || null,
      horario_almoco_inicio: form.horario_almoco_inicio || null,
      horario_almoco_fim: form.horario_almoco_fim || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("configuracoes_clinica")
      .upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
  }

  function setField<K extends keyof ClinicaConfig>(k: K, v: ClinicaConfig[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Dados da Clínica</h2>
          <p className="text-xs text-gray-500">
            Horários definem disponibilidade padrão para a agenda.
          </p>
        </div>
        <Button
          onClick={save}
          disabled={saving || loading}
          className="bg-[#D67F43] hover:bg-[#B85A24]"
        >
          <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>

      {loading ? (
        <p className="px-5 py-6 text-sm text-gray-400">Carregando…</p>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome da clínica</Label>
            <Input
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={form.telefone ?? ""}
              onChange={(e) => setField("telefone", e.target.value)}
              placeholder="(11) 99999-0000"
              maxLength={30}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="contato@estacaoaprender.com"
              maxLength={255}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereço completo</Label>
            <Textarea
              rows={2}
              value={form.endereco ?? ""}
              onChange={(e) => setField("endereco", e.target.value)}
              maxLength={400}
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4 md:col-span-2">
            <legend className="px-1 text-sm font-medium text-gray-700">
              Horário de funcionamento
            </legend>

            <div className="grid gap-3 md:grid-cols-2">
              <TimePair
                label="Segunda a sexta"
                start={form.horario_seg_sex_inicio}
                end={form.horario_seg_sex_fim}
                onChange={(s, e) => {
                  setField("horario_seg_sex_inicio", s);
                  setField("horario_seg_sex_fim", e);
                }}
              />
              <TimePair
                label="Sábado (vazio = fechado)"
                start={form.horario_sab_inicio}
                end={form.horario_sab_fim}
                onChange={(s, e) => {
                  setField("horario_sab_inicio", s);
                  setField("horario_sab_fim", e);
                }}
              />
              <TimePair
                label="Almoço (bloqueia agenda)"
                start={form.horario_almoco_inicio}
                end={form.horario_almoco_fim}
                onChange={(s, e) => {
                  setField("horario_almoco_inicio", s);
                  setField("horario_almoco_fim", e);
                }}
              />
            </div>
          </fieldset>
        </div>
      )}
    </section>
  );
}

function TimePair({
  label,
  start,
  end,
  onChange,
}: {
  label: string;
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-600">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="time"
          value={start ?? ""}
          onChange={(e) => onChange(e.target.value || null, end)}
          className="w-32"
        />
        <span className="text-xs text-gray-400">até</span>
        <Input
          type="time"
          value={end ?? ""}
          onChange={(e) => onChange(start, e.target.value || null)}
          className="w-32"
        />
      </div>
    </div>
  );
}