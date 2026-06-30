import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import {
  fetchHeader,
  invalidateCmsCache,
  HEADER_DEFAULTS,
  type SiteHeader,
  type SiteHeaderItem,
} from "@/lib/cms";
import { PreviewFrame } from "./PreviewFrame";
import { Header } from "@/components/site/Header";
import { ColorField } from "./ColorField";

type Form = Omit<SiteHeader, "id">;

const initial: Form = { ...HEADER_DEFAULTS };

function newItem(order: number): SiteHeaderItem {
  return { id: `tmp-${Math.random().toString(36).slice(2, 9)}`, label: "", to: "/", order, visivel: true };
}

export function HeaderManager() {
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      invalidateCmsCache("header");
      const h = await fetchHeader();
      if (h) {
        const { id: _id, ...rest } = h;
        setForm({
          ...HEADER_DEFAULTS,
          ...rest,
          itens: rest.itens?.length ? rest.itens : HEADER_DEFAULTS.itens,
        });
      }
      setLoading(false);
    })();
  }, []);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `header/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) return toast.error("Falha no upload: " + error.message);
    setForm((f) => ({ ...f, logo_url: path }));
    toast.success("Logo enviado");
  }

  function setItem(idx: number, patch: Partial<SiteHeaderItem>) {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }
  function addItem() {
    setForm((f) => ({ ...f, itens: [...f.itens, newItem(f.itens.length)] }));
  }
  function removeItem(idx: number) {
    setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i })) }));
  }
  function moveItem(idx: number, dir: -1 | 1) {
    setForm((f) => {
      const arr = [...f.itens];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...f, itens: arr.map((it, i) => ({ ...it, order: i })) };
    });
  }

  async function save() {
    setSaving(true);
    const { itens, ...header } = form;
    const { error } = await supabase
      .from("site_header")
      .upsert({ id: "singleton", ...header, updated_at: new Date().toISOString() });
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    // Substitui itens: apaga todos e re-insere
    const { error: delErr } = await supabase
      .from("site_header_itens")
      .delete()
      .eq("header_id", "singleton");
    if (delErr) {
      setSaving(false);
      return toast.error(delErr.message);
    }
    if (itens.length) {
      const rows = itens.map((it, i) => ({
        header_id: "singleton",
        label: it.label,
        to: it.to,
        order: i,
        visivel: it.visivel,
      }));
      const { error: insErr } = await supabase.from("site_header_itens").insert(rows);
      if (insErr) {
        setSaving(false);
        return toast.error(insErr.message);
      }
    }
    setSaving(false);
    invalidateCmsCache("header");
    toast.success("Cabeçalho atualizado");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const previewOverride: Partial<SiteHeader> = {
    ...form,
    logo_url: form.logo_url
      ? form.logo_url.startsWith("http") ? form.logo_url : publicImageUrl(form.logo_url)
      : null,
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
      <div className="space-y-4">
        <Tabs defaultValue="conteudo">
          <TabsList>
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          </TabsList>

          <TabsContent value="conteudo" className="space-y-6 pt-4">
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Logo e marca</h2>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-[#FEF3E8] flex items-center justify-center">
                  {form.logo_url ? (
                    <img src={publicImageUrl(form.logo_url) ?? ""} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">padrão</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleLogoUpload(f);
                        e.target.value = "";
                      }}
                    />
                    <Button asChild type="button" size="sm" variant="outline" disabled={uploading}>
                      <span><Upload className="mr-2 h-4 w-4" />{uploading ? "Enviando…" : "Trocar logo"}</span>
                    </Button>
                  </label>
                  {form.logo_url && (
                    <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, logo_url: null })}>
                      Remover (usar padrão)
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <Label>Nome da marca</Label>
                  <Input value={form.nome_marca ?? ""} onChange={(e) => setForm({ ...form, nome_marca: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.mostrar_nome} onCheckedChange={(v) => setForm({ ...form, mostrar_nome: v })} />
                  Mostrar
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Itens do menu</h2>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
              </div>
              <div className="space-y-2">
                {form.itens.map((it, i) => (
                  <div key={it.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-2">
                    <Input placeholder="Rótulo" value={it.label} onChange={(e) => setItem(i, { label: e.target.value })} />
                    <Input placeholder="/destino" value={it.to} onChange={(e) => setItem(i, { to: e.target.value })} />
                    <Switch checked={it.visivel} onCheckedChange={(v) => setItem(i, { visivel: v })} />
                    <Button size="icon" variant="ghost" onClick={() => moveItem(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => moveItem(i, 1)} disabled={i === form.itens.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
                {form.itens.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum item — clique em Adicionar.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Botão de ação (CTA)</h2>
                <Switch checked={form.cta_visivel} onCheckedChange={(v) => setForm({ ...form, cta_visivel: v })} />
              </div>
              {form.cta_visivel && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Texto</Label>
                    <Input value={form.cta_label ?? ""} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Input value={form.cta_to ?? ""} onChange={(e) => setForm({ ...form, cta_to: e.target.value })} />
                  </div>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-6 pt-4">
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fundo do cabeçalho</h2>
              <ColorField
                label="Cor de fundo"
                value={form.bg_cor}
                onChange={(v) => setForm((f) => ({ ...f, bg_cor: v }))}
                value2={form.bg_cor_2}
                onChange2={(v) => setForm((f) => ({ ...f, bg_cor_2: v }))}
                allowGradient
                presets={["#FFFFFF", "#FEF3E8", "#0F172A", "#1F2937", "#D67F43", "#FFFFFFCC"]}
                helperText="Deixe em branco para usar o branco translúcido padrão."
              />
            </section>

            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Texto e destaque</h2>
              <div className="space-y-2">
                <Label>Contraste do texto</Label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={form.texto_cor !== "claro" ? "default" : "outline"} onClick={() => setForm({ ...form, texto_cor: "escuro" })}>Escuro</Button>
                  <Button type="button" size="sm" variant={form.texto_cor === "claro" ? "default" : "outline"} onClick={() => setForm({ ...form, texto_cor: "claro" })}>Claro</Button>
                </div>
                <p className="text-xs text-muted-foreground">Use “Claro” quando o fundo for escuro.</p>
              </div>
              <ColorField
                label="Cor de destaque (CTA e hover dos links)"
                value={form.cor_destaque}
                onChange={(v) => setForm((f) => ({ ...f, cor_destaque: v }))}
                presets={["#D67F43", "#B85A24", "#0EA5E9", "#16A34A", "#9333EA", "#0F172A"]}
              />
            </section>

            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fixar no topo</h2>
                  <p className="text-xs text-muted-foreground">O cabeçalho acompanha a rolagem.</p>
                </div>
                <Switch checked={form.sticky} onCheckedChange={(v) => setForm({ ...form, sticky: v })} />
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <PreviewFrame height={180} mobileHeight={180}>
          <Header override={previewOverride} />
        </PreviewFrame>
        <p className="mt-2 text-xs text-muted-foreground">Prévia em tempo real do cabeçalho.</p>
      </div>
    </div>
  );
}