import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, X } from "lucide-react";
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
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import { fetchTeam, type TeamMember } from "@/lib/cms";

export const Route = createFileRoute("/admin/equipe")({
  component: AdminEquipe,
});

type FormState = {
  id?: string;
  nome: string;
  titulo: string;
  foto_url: string | null;
  especialidades: string;
  bio: string;
  registro: string;
  enabled: boolean;
};

const empty: FormState = {
  nome: "",
  titulo: "",
  foto_url: null,
  especialidades: "",
  bio: "",
  registro: "",
  enabled: true,
};

function AdminEquipe() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    const data = await fetchTeam(true);
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

  function openEdit(m: TeamMember) {
    setForm({
      id: m.id,
      nome: m.nome,
      titulo: m.titulo,
      foto_url: m.foto_url,
      especialidades: m.especialidades.join(", "),
      bio: m.bio ?? "",
      registro: m.registro ?? "",
      enabled: m.enabled,
    });
    setOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `team/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) {
      toast.error("Falha no upload: " + error.message);
      return;
    }
    setForm((f) => ({ ...f, foto_url: path }));
    toast.success("Foto enviada");
  }

  async function save() {
    setSaving(true);
    const especialidades = form.especialidades
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      nome: form.nome.trim(),
      titulo: form.titulo.trim(),
      foto_url: form.foto_url,
      especialidades,
      bio: form.bio.trim() || null,
      registro: form.registro.trim() || null,
      enabled: form.enabled,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("team_members").update(payload).eq("id", form.id));
    } else {
      const nextOrder = items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;
      ({ error } = await supabase
        .from("team_members")
        .insert({ ...payload, order: nextOrder }));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Salvo");
    setOpen(false);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Remover este profissional?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
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
    const { error } = await supabase.rpc;
    void error;
    // simple: swap orders via two updates
    const r1 = await supabase
      .from("team_members")
      .update({ order: b.order })
      .eq("id", a.id);
    const r2 = await supabase
      .from("team_members")
      .update({ order: a.order })
      .eq("id", b.id);
    if (r1.error || r2.error) {
      toast.error("Falha ao reordenar");
      return;
    }
    void load();
  }

  async function toggleEnabled(m: TeamMember) {
    const { error } = await supabase
      .from("team_members")
      .update({ enabled: !m.enabled })
      .eq("id", m.id);
    if (error) return toast.error(error.message);
    void load();
  }

  return (
    <AdminShell title="Equipe">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {items.length} profissional{items.length !== 1 ? "is" : ""} cadastrado
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
          {items.map((m, idx) => (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FEF3E8]">
                {m.foto_url ? (
                  <img src={m.foto_url} alt={m.nome} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#D67F43]">
                    {m.nome
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{m.nome}</p>
                <p className="truncate text-sm text-gray-500">{m.titulo}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => move(m.id, -1)}
                  disabled={idx === 0}
                  aria-label="Subir"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => move(m.id, 1)}
                  disabled={idx === items.length - 1}
                  aria-label="Descer"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Switch checked={m.enabled} onCheckedChange={() => toggleEnabled(m)} />
                <Button size="icon" variant="ghost" onClick={() => openEdit(m)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(m.id)}
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar profissional" : "Novo profissional"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Foto</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-lg bg-[#FEF3E8]">
                  {form.foto_url ? (
                    <img
                      src={publicImageUrl(form.foto_url) ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      sem foto
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Enviando…" : "Enviar foto"}
                  </Button>
                  {form.foto_url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setForm((f) => ({ ...f, foto_url: null }))}
                    >
                      <X className="mr-2 h-4 w-4" /> Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Psicóloga Infantil"
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidades (separadas por vírgula)</Label>
              <Input
                value={form.especialidades}
                onChange={(e) => setForm({ ...form, especialidades: e.target.value })}
                placeholder="ABA, TEA, Habilidades sociais"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Registro (CRP, CRFa…)</Label>
              <Input
                value={form.registro}
                onChange={(e) => setForm({ ...form, registro: e.target.value })}
                placeholder="Opcional"
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