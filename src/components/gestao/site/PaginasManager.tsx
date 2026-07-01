import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink,
  ArrowLeft, Upload, X, Home, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import { fetchPaginas, invalidateCmsCache, type SitePagina } from "@/lib/cms";
import { SecoesManager } from "./SecoesManager";
import { pageCanonicalUrl } from "@/lib/site-page-routes";

type Form = Omit<SitePagina, "id" | "order"> & { id?: string };

const EMPTY: Form = {
  slug: "",
  titulo: "",
  is_home: false,
  enabled: true,
  meta_title: null,
  meta_description: null,
  og_image: null,
  banner_eyebrow: null,
  banner_titulo: null,
  banner_descricao: null,
  banner_imagem_url: null,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function PaginasManager() {
  const [items, setItems] = useState<SitePagina[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SitePagina | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    invalidateCmsCache("paginas");
    const data = await fetchPaginas(true);
    setItems(data);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setDialogOpen(true);
  }
  function openEditDialog(p: SitePagina) {
    setForm({
      id: p.id,
      slug: p.slug,
      titulo: p.titulo,
      is_home: p.is_home,
      enabled: p.enabled,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      og_image: p.og_image,
      banner_eyebrow: p.banner_eyebrow,
      banner_titulo: p.banner_titulo,
      banner_descricao: p.banner_descricao,
      banner_imagem_url: p.banner_imagem_url,
    });
    setDialogOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `paginas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET).upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) return toast.error("Falha no upload: " + error.message);
    setForm((f) => ({ ...f, banner_imagem_url: path }));
    toast.success("Imagem enviada");
  }

  async function save() {
    if (!form.titulo.trim()) return toast.error("Informe um título para a página.");
    const slug = (form.slug.trim() || slugify(form.titulo)).trim();
    if (!slug) return toast.error("Slug inválido.");
    setSaving(true);
    const payload = {
      slug,
      titulo: form.titulo.trim(),
      enabled: form.enabled,
      meta_title: form.meta_title?.trim() || null,
      meta_description: form.meta_description?.trim() || null,
      og_image: form.og_image || null,
      banner_eyebrow: form.banner_eyebrow?.trim() || null,
      banner_titulo: form.banner_titulo?.trim() || null,
      banner_descricao: form.banner_descricao?.trim() || null,
      banner_imagem_url: form.banner_imagem_url || null,
      updated_at: new Date().toISOString(),
    };
    if (form.id) {
      const { error } = await supabase.from("site_paginas").update(payload).eq("id", form.id);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      const nextOrder = items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;
      const { error } = await supabase
        .from("site_paginas")
        .insert({ ...payload, order: nextOrder, is_home: false });
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    setSaving(false);
    toast.success("Página salva");
    setDialogOpen(false);
    void load();
  }

  async function remove(p: SitePagina) {
    if (p.is_home) return toast.error("A página Home não pode ser removida.");
    if (!confirm(`Remover a página "${p.titulo}"? As seções vinculadas também serão removidas.`)) return;
    const { error } = await supabase.from("site_paginas").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Página removida");
    void load();
  }

  async function move(p: SitePagina, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === p.id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const a = items[idx], b = items[swap];
    const r1 = await supabase.from("site_paginas").update({ order: b.order }).eq("id", a.id);
    const r2 = await supabase.from("site_paginas").update({ order: a.order }).eq("id", b.id);
    if (r1.error || r2.error) return toast.error("Falha ao reordenar");
    void load();
  }

  async function toggleEnabled(p: SitePagina) {
    if (p.is_home && p.enabled) return toast.error("A Home não pode ser ocultada.");
    const { error } = await supabase.from("site_paginas").update({ enabled: !p.enabled }).eq("id", p.id);
    if (error) return toast.error(error.message);
    void load();
  }

  // ----- Builder view -----
  if (editing) {
    return (
      <PaginaBuilder
        pagina={editing}
        onBack={() => { setEditing(null); void load(); }}
      />
    );
  }

  // ----- List view -----
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} página{items.length !== 1 ? "s" : ""}. Cada página tem seu banner e suas próprias seções.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            A página <strong>Home</strong> é renderizada em <code>/</code>. As demais aparecem em <code>/&lt;slug&gt;</code>.
          </p>
        </div>
        <Button onClick={openNew} className="bg-[#D67F43] hover:bg-[#B85A24]">
          <Plus className="mr-2 h-4 w-4" /> Nova página
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="space-y-2">
          {items.map((p, idx) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {p.is_home ? <Home className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{p.titulo}</p>
                  {p.is_home && (
                    <span className="rounded bg-[#FEF3E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B85A24] dark:bg-brand/15 dark:text-brand">
                      Home
                    </span>
                  )}
                  {!p.enabled && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <EyeOff className="h-3.5 w-3.5" /> Oculta
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  <code>{pageCanonicalUrl(p.slug, p.is_home)}</code>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button asChild size="icon" variant="ghost" title="Ver página">
                  <a href={pageCanonicalUrl(p.slug, p.is_home)} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(p, -1)} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(p, 1)} disabled={idx === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => toggleEnabled(p)} title={p.enabled ? "Ocultar" : "Mostrar"}>
                  {p.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(p)} title="Editar dados"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Construir</Button>
                <Button size="icon" variant="ghost" onClick={() => remove(p)} disabled={p.is_home} title="Excluir"><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog: dados da página */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar página" : "Nova página"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basico" className="mt-2">
            <TabsList>
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="banner">Banner</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-3 pt-3">
              <div>
                <Label>Título da página</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    titulo: e.target.value,
                    slug: f.id ? f.slug : slugify(e.target.value),
                  }))}
                  placeholder="Ex.: Novidades"
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">/</span>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    disabled={form.id ? items.find((i) => i.id === form.id)?.is_home : false}
                    placeholder="novidades"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Usado na URL pública.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="text-sm">Página ativa</Label>
                  <p className="text-xs text-muted-foreground">Desligue para ocultar do site sem excluir.</p>
                </div>
                <Switch checked={form.enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
              </div>
            </TabsContent>

            <TabsContent value="banner" className="space-y-3 pt-3">
              <div>
                <Label>Etiqueta (eyebrow)</Label>
                <Input value={form.banner_eyebrow ?? ""} onChange={(e) => setForm((f) => ({ ...f, banner_eyebrow: e.target.value }))} placeholder="Ex.: Sobre nós" />
              </div>
              <div>
                <Label>Título do banner</Label>
                <Input value={form.banner_titulo ?? ""} onChange={(e) => setForm((f) => ({ ...f, banner_titulo: e.target.value }))} placeholder="Título grande" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea rows={3} value={form.banner_descricao ?? ""} onChange={(e) => setForm((f) => ({ ...f, banner_descricao: e.target.value }))} placeholder="Texto introdutório do banner" />
              </div>
              <div>
                <Label>Imagem (opcional)</Label>
                <p className="mb-1 text-[11px] text-muted-foreground">
                  Também vira a capa da página no dashboard (prioridade máxima).
                </p>
                {form.banner_imagem_url ? (
                  <div className="relative inline-block">
                    <img src={publicImageUrl(form.banner_imagem_url) ?? ""} alt="" className="h-32 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, banner_imagem_url: null }))}
                      className="absolute -top-2 -right-2 rounded-full bg-white p-1 shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <Upload className="mr-2 h-4 w-4" /> {uploading ? "Enviando…" : "Enviar imagem"}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-3 pt-3">
              <div>
                <Label>Meta title</Label>
                <Input value={form.meta_title ?? ""} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} placeholder="Aparece na aba do navegador e Google" />
              </div>
              <div>
                <Label>Meta description</Label>
                <Textarea rows={3} value={form.meta_description ?? ""} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} placeholder="Resumo que aparece no Google (até 160 caracteres)" />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ====== Builder: edit one page's sections ======
export function PaginaBuilder({
  pagina, onBack, openSecaoId,
}: { pagina: SitePagina; onBack: () => void; openSecaoId?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{pagina.titulo}</h2>
            <p className="text-xs text-muted-foreground">
              Editando seções de <code>{pageCanonicalUrl(pagina.slug, pagina.is_home)}</code>
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={pageCanonicalUrl(pagina.slug, pagina.is_home)} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Ver página
          </a>
        </Button>
      </div>
      <SecoesManager paginaId={pagina.id} openSecaoId={openSecaoId} />
    </div>
  );
}