import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import { invalidateCmsCache, HERO_DEFAULTS, type SiteHero } from "@/lib/cms";
import { PreviewFrame } from "./PreviewFrame";
import { Hero, type HeroLayout } from "@/components/site/sections/Hero";
import { ColorField } from "./ColorField";
import { LinkField } from "./LinkField";

const HERO_LAYOUT_OPTIONS: { key: HeroLayout; label: string; hint: string }[] = [
  { key: "imagem-direita", label: "Imagem à direita", hint: "Texto à esquerda, imagem à direita" },
  { key: "imagem-esquerda", label: "Imagem à esquerda", hint: "Espelhado — texto à direita" },
  { key: "imagem-fundo", label: "Imagem de fundo", hint: "Imagem full-bleed com overlay escuro" },
  { key: "centralizado", label: "Centralizado", hint: "Texto e CTAs centrais, sem imagem grande" },
  { key: "empilhado", label: "Empilhado", hint: "Texto em cima, imagem embaixo" },
  { key: "minimalista", label: "Minimalista", hint: "Só título, subtítulo e CTAs" },
];

function HeroLayoutThumb({ layout }: { layout: HeroLayout }) {
  const brand = "bg-[#D67F43]";
  const soft = "bg-[#FEF3E8]";
  const line = "rounded-sm bg-gray-300";
  const btn = "rounded-full bg-[#D67F43]";
  const img = "rounded bg-gradient-to-br from-slate-300 to-slate-500";
  if (layout === "imagem-direita") {
    return (
      <div className={`flex h-full w-full items-center gap-1.5 ${soft} p-2`}>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className={`h-1.5 w-full ${line}`} />
          <div className={`h-1 w-4/5 ${line}`} />
          <div className={`mt-0.5 h-1.5 w-8 ${btn}`} />
        </div>
        <div className={`h-10 w-10 ${img}`} />
      </div>
    );
  }
  if (layout === "imagem-esquerda") {
    return (
      <div className={`flex h-full w-full items-center gap-1.5 ${soft} p-2`}>
        <div className={`h-10 w-10 ${img}`} />
        <div className="flex flex-1 flex-col gap-0.5">
          <div className={`h-1.5 w-full ${line}`} />
          <div className={`h-1 w-4/5 ${line}`} />
          <div className={`mt-0.5 h-1.5 w-8 ${btn}`} />
        </div>
      </div>
    );
  }
  if (layout === "imagem-fundo") {
    return (
      <div className={`relative flex h-full w-full items-center ${img} p-2`}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative flex flex-col gap-0.5">
          <div className="h-1.5 w-16 rounded-sm bg-white/90" />
          <div className="h-1 w-12 rounded-sm bg-white/70" />
          <div className={`mt-0.5 h-1.5 w-8 ${btn}`} />
        </div>
      </div>
    );
  }
  if (layout === "centralizado") {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-1 ${soft} p-2`}>
        <div className={`h-1.5 w-20 ${line}`} />
        <div className={`h-1 w-16 ${line}`} />
        <div className="mt-0.5 flex gap-1">
          <div className={`h-1.5 w-6 ${btn}`} />
          <div className="h-1.5 w-6 rounded-full border border-gray-300 bg-white" />
        </div>
      </div>
    );
  }
  if (layout === "empilhado") {
    return (
      <div className={`flex h-full w-full flex-col items-center gap-1 ${soft} p-1.5`}>
        <div className={`h-1.5 w-16 ${line}`} />
        <div className={`h-1 w-12 ${line}`} />
        <div className={`h-1.5 w-6 ${btn}`} />
        <div className={`h-6 w-full ${img}`} />
      </div>
    );
  }
  // minimalista
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1 bg-white p-2">
      <div className={`h-1.5 w-20 ${line}`} />
      <div className={`h-1 w-14 ${line}`} />
      <div className={`mt-0.5 h-1.5 w-8 ${btn}`} />
    </div>
  );
}

type Form = Omit<SiteHero, "id">;

// Começa pré-preenchido com os mesmos valores que aparecem na Home,
// para o usuário ver de cara o que está editando.
const initial: Form = { ...HERO_DEFAULTS };

export function HeroManager() {
  const [form, setForm] = useState<Form>(initial);
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
        // Para cada campo, se o banco está vazio/null, mantém o default visível.
        const merged: Form = { ...HERO_DEFAULTS };
        for (const k of Object.keys(merged) as (keyof Form)[]) {
          const v = (rest as Partial<Form>)[k];
          if (v !== undefined && v !== null && v !== "") {
            (merged as any)[k] = v;
          }
        }
        setForm(merged);
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

  // Para a prévia: a URL da imagem pode ser um path cru do storage.
  const previewOverride = {
    ...form,
    imagem_url: form.imagem_url
      ? form.imagem_url.startsWith("http")
        ? form.imagem_url
        : publicImageUrl(form.imagem_url)
      : HERO_DEFAULTS.imagem_url,
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
      <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estilo do banner</h2>
        <p className="text-xs text-muted-foreground">Escolha como o conteúdo aparece no topo da Home.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {HERO_LAYOUT_OPTIONS.map((opt) => {
            const selected = (form.layout || "imagem-direita") === opt.key;
            return (
              <button
                type="button"
                key={opt.key}
                onClick={() => setForm((f) => ({ ...f, layout: opt.key }))}
                className={
                  "flex flex-col overflow-hidden rounded-lg border text-left transition " +
                  (selected
                    ? "border-[#D67F43] ring-2 ring-[#D67F43]/40 bg-[#FEF3E8]/50"
                    : "border-border hover:border-[#D67F43]/60 bg-card")
                }
              >
                <div className="h-16 w-full border-b border-border bg-white">
                  <HeroLayoutThumb layout={opt.key} />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium leading-tight">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{opt.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

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
          <div className="min-w-0">
            <LinkField label="Botão principal — link" value={form.cta_primario_link ?? ""} onChange={(v) => setForm({ ...form, cta_primario_link: v })} />
          </div>
          <div className="space-y-2">
            <Label>Botão secundário — texto</Label>
            <Input value={form.cta_secundario_texto ?? ""} onChange={(e) => setForm({ ...form, cta_secundario_texto: e.target.value })} />
          </div>
          <div className="min-w-0">
            <LinkField label="Botão secundário — link" value={form.cta_secundario_link ?? ""} onChange={(v) => setForm({ ...form, cta_secundario_link: v })} />
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

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cor de fundo</h2>
        <p className="text-xs text-muted-foreground">A imagem do banner aparece sobre esta cor (visível principalmente em desktop, ao redor da imagem).</p>
        <ColorField
          label="Fundo do banner"
          value={form.bg_cor}
          onChange={(v) => setForm((f) => ({ ...f, bg_cor: v }))}
          value2={form.bg_cor_2}
          onChange2={(v) => setForm((f) => ({ ...f, bg_cor_2: v }))}
          allowGradient
          presets={["#FEF3E8", "#FDDFC4", "#FFFFFF", "#F3F4F6", "#0F172A", "#D67F43"]}
          helperText="Deixe em branco para usar o gradiente creme padrão da Home."
        />
        <ColorField
          label="Cor do texto"
          value={form.texto_cor}
          onChange={(v) => setForm((f) => ({ ...f, texto_cor: v }))}
          presets={["#0F172A", "#1F2937", "#FFFFFF", "#FEF3E8", "#D67F43", "#475569"]}
          helperText="Aplica em título e subtítulo. Em branco, usa o cinza escuro padrão."
        />
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <PreviewFrame height={620} mobileHeight={900}>
          <Hero override={previewOverride} />
        </PreviewFrame>
        <p className="mt-2 text-xs text-muted-foreground">
          Aparece no topo da Home. Atualiza enquanto você digita.
        </p>
      </div>
    </div>
  );
}