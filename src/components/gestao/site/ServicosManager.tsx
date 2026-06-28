import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, X } from "lucide-react";
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
import { fetchServicos, invalidateCmsCache, type SiteServico } from "@/lib/cms";

type FormState = {
  id?: string;
  titulo: string;
  descricao: string;
  imagem_url: string | null;
  link: string;
  enabled: boolean;
};

const empty: FormState = {
  titulo: "",
  descricao: "",
  imagem_url: null,
  link: "",
  enabled: true,
};

export function ServicosManager() {
  const [items, setItems] = useState<SiteServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    invalidateCmsCache("servicos");
    const data = await fetchServicos(true);
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
  function openEdit(s: SiteServico) {
    setForm({
      id: s.id,
      titulo: s.titulo,
      descricao: s.descricao ?? "",
      imagem_url: s.imagem_url,
      link: s.link ?? "",
      enabled: s.enabled,
    });
    setOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `servicos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) return toast.error("Falha no upload: " + error.message);
    setForm((f) => ({ ...f, imagem_url: path }));
    toast.success("Imagem enviada");
  }

  async function save() {
    if (!form.titulo.trim()) return toast.error("Informe o título");
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      imagem_url: form.imagem_url,
      link: form.link.trim() || null,
      enabled: form.enabled,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("site_servicos").update(payload).eq("id", form.id));
    } else {
      const nextOrder = items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;
      ({ error } = await supabase.from("site_servicos").insert({ ...payload, order: nextOrder }));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    setOpen(false);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Remover este serviço?")) return;
    const { error } = await supabase.from("site_servicos").delete().eq("id", id);
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
    const r1 = await supabase.from("site_servicos").update({ order: b.order }).eq("id", a.id);
    const r2 = await supabase.from("site_servicos").update({ order: a.order }).eq("id", b.id);
    if (r1.error || r2.error) return toast.error("Falha ao reordenar");
    void load();
  }

  async function toggleEnabled(s: SiteServico) {
    const { error } = await supabase
      .from("site_servicos")
      .update({ enabled: !s.enabled })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    void load();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} serviço{items.length !== 1 ? "s" : ""} cadastrado{items.length !== 1 ? "s" : ""}.
        </p>
        <Button onClick={openNew} className="bg-[#D67F43] hover:bg-[#B85A24]">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum serviço cadastrado ainda. Clique em <strong>Adicionar</strong> para criar o primeiro.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FEF3E8]">
                {s.imagem_url ? (
                  <img src={s.imagem_url} alt={s.titulo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#D67F43]">
                    {s.titulo.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.titulo}</p>
                <p className="truncate text-sm text-muted-foreground">{s.descricao}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(s.id, -1)} disabled={idx === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(s.id, 1)} disabled={idx === items.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Switch checked={s.enabled} onCheckedChange={() => toggleEnabled(s)} />
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s.id)}>
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
            <DialogTitle>{form.id ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem / ícone</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-lg bg-[#FEF3E8]">
                  {form.imagem_url ? (
                    <img src={publicImageUrl(form.imagem_url) ?? ""} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      sem imagem
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                    e.target.value = "";
                  }} />
                  <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Enviando…" : "Enviar imagem"}
                  </Button>
                  {form.imagem_url && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setForm((f) => ({ ...f, imagem_url: null }))}>
                      <X className="mr-2 h-4 w-4" /> Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição curta</Label>
              <Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Link (opcional)</Label>
              <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/Servicos?servico=psicoterapia" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Visível no site</p>
                <p className="text-xs text-muted-foreground">Desligue para ocultar sem deletar.</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}