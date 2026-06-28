import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import { invalidateCmsCache, type SiteHero } from "@/lib/cms";

type Form = Omit<SiteHero, "id">;

const empty: Form = {
  titulo: "",
  titulo_destaque: "",
  subtitulo: "",
  cta_primario_texto: "",
  cta_primario_link: "",
  cta_secundario_texto: "",
  cta_secundario_link: "",
  imagem_url: null,
  badge_enabled: true,
  badge_titulo: "",
  badge_subtitulo: "",
};

export function HeroManager() {
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      // Lê direto do banco para receber o PATH cru (não a URL pública).
      const { data, error } = await supabase
        .from("site_hero")
        .select("*")
        .eq("id", "singleton")
        .maybeSingle();
      if (error) console.error(error);
      if (data) {
        const { id: _id, updated_at: _u, ...rest } = data as Record<string, unknown>;
        setForm({ ...empty, ...(rest as Partial<Form>) });
      }
      setLoading(false);
    })();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) return toast.error("Falha no upload: " + error.message);
    setForm((f) => ({ ...f, imagem_url: path }));
    toast.success("Imagem enviada");
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("site_hero")
      .upsert({ id: "singleton", ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    invalidateCmsCache("hero");
    toast.success("Banner atualizado");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Imagem do banner</h2>
        <div className="flex items-start gap-4">
          <div className="h-32 w-48 overflow-hidden rounded-lg bg-[#FEF3E8]">
            {form.imagem_url ? (
              <img src={publicImageUrl(form.imagem_url) ?? ""} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">sem imagem</div>
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
              {uploading ? "Enviando…" : "Trocar imagem"}
            </Button>
            {form.imagem_url && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setForm((f) => ({ ...f, imagem_url: null }))}>
                <X className="mr-2 h-4 w-4" /> Remover
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Texto principal</h2>
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={form.titulo ?? ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Cuidamos de cada fase de desenvolvimento do" />
        </div>
        <div className="space-y-2">
          <Label>Palavra em destaque (cor laranja)</Label>
          <Input value={form.titulo_destaque ?? ""} onChange={(e) => setForm({ ...form, titulo_destaque: e.target.value })} placeholder="seu filho(a)" />
        </div>
        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Textarea rows={3} value={form.subtitulo ?? ""} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Botões de ação</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Botão principal — texto</Label>
            <Input value={form.cta_primario_texto ?? ""} onChange={(e) => setForm({ ...form, cta_primario_texto: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Botão principal — link</Label>
            <Input value={form.cta_primario_link ?? ""} onChange={(e) => setForm({ ...form, cta_primario_link: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Botão secundário — texto</Label>
            <Input value={form.cta_secundario_texto ?? ""} onChange={(e) => setForm({ ...form, cta_secundario_texto: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Botão secundário — link</Label>
            <Input value={form.cta_secundario_link ?? ""} onChange={(e) => setForm({ ...form, cta_secundario_link: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Selo / destaque</h2>
            <p className="text-xs text-muted-foreground">Card branco sobreposto à imagem do banner.</p>
          </div>
          <Switch checked={form.badge_enabled} onCheckedChange={(v) => setForm({ ...form, badge_enabled: v })} />
        </div>
        {form.badge_enabled && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Título do selo</Label>
              <Input value={form.badge_titulo ?? ""} onChange={(e) => setForm({ ...form, badge_titulo: e.target.value })} placeholder="+500 famílias" />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo do selo</Label>
              <Input value={form.badge_subtitulo ?? ""} onChange={(e) => setForm({ ...form, badge_subtitulo: e.target.value })} placeholder="atendidas com sucesso" />
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}