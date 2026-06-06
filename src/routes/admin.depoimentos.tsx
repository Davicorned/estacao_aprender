import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchTestimonials, type Testimonial } from "@/lib/cms";

export const Route = createFileRoute("/admin/depoimentos")({
  component: AdminDepoimentos,
});

type FormState = {
  id?: string;
  nome: string;
  texto: string;
  fonte: string;
  enabled: boolean;
};

const empty: FormState = { nome: "", texto: "", fonte: "Google", enabled: true };

function AdminDepoimentos() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetchTestimonials(true);
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openNew() {
    setForm({ ...empty });
    setOpen(true);
  }

  function openEdit(t: Testimonial) {
    setForm({
      id: t.id,
      nome: t.nome,
      texto: t.texto,
      fonte: t.fonte ?? "Google",
      enabled: t.enabled,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      texto: form.texto.trim(),
      fonte: form.fonte.trim() || null,
      enabled: form.enabled,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("testimonials").update(payload).eq("id", form.id));
    } else {
      const nextOrder = items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;
      ({ error } = await supabase
        .from("testimonials")
        .insert({ ...payload, order: nextOrder }));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    setOpen(false);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Remover este depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    void load();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const a = items[idx];
    const b = items[swap];
    const r1 = await supabase.from("testimonials").update({ order: b.order }).eq("id", a.id);
    const r2 = await supabase.from("testimonials").update({ order: a.order }).eq("id", b.id);
    if (r1.error || r2.error) return toast.error("Falha ao reordenar");
    void load();
  }

  async function toggleEnabled(t: Testimonial) {
    const { error } = await supabase
      .from("testimonials")
      .update({ enabled: !t.enabled })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    void load();
  }

  return (
    <AdminShell title="Depoimentos">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {items.length} depoimento{items.length !== 1 ? "s" : ""} cadastrado
          {items.length !== 1 ? "s" : ""}.
        </p>
        <Button onClick={openNew} className="bg-[#D67F43] hover:bg-[#B85A24]">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando…</p>
      ) : (
        <div className="space-y-2">
          {items.map((t, idx) => (
            <div
              key={t.id}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{t.nome}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{t.texto}</p>
                {t.fonte && <p className="mt-1 text-xs text-gray-400">via {t.fonte}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => move(t.id, -1)}
                  disabled={idx === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => move(t.id, 1)}
                  disabled={idx === items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Switch checked={t.enabled} onCheckedChange={() => toggleEnabled(t)} />
                <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(t.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar depoimento" : "Novo depoimento"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Depoimento</Label>
              <Textarea
                rows={6}
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fonte</Label>
              <Input
                value={form.fonte}
                onChange={(e) => setForm({ ...form, fonte: e.target.value })}
                placeholder="Google, Instagram…"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Visível no site</p>
                <p className="text-xs text-gray-500">Desligue para ocultar sem deletar.</p>
              </div>
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm({ ...form, enabled: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}