import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCmsCache, TEMA_DEFAULTS, type SiteTema } from "@/lib/cms";
import { ColorField } from "./ColorField";
import { PreviewFrame } from "./PreviewFrame";

type Form = Omit<SiteTema, "id">;

const FONTES = ["Inter", "Roboto", "Poppins", "Montserrat", "Lato", "Open Sans", "Nunito", "Playfair Display", "Merriweather"];

function ThemePreview({ t }: { t: Form }) {
  const secondary = t.cor_secundaria ?? t.cor_primaria;
  const eyebrow = t.cor_eyebrow ?? t.cor_primaria;
  return (
    <div
      style={{
        background: t.cor_fundo,
        color: t.cor_texto,
        fontFamily: t.fonte_corpo,
        padding: 32,
        minHeight: "100%",
      }}
    >
      <p
        style={{
          color: eyebrow,
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        Eyebrow / categoria
      </p>
      <h1 style={{ fontFamily: t.fonte_titulos, fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
        Cuidamos de cada fase com{" "}
        <span
          style={{
            background: `linear-gradient(135deg, ${t.cor_primaria}, ${secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          carinho
        </span>
      </h1>
      <p style={{ marginTop: 16, opacity: 0.85, maxWidth: 520, lineHeight: 1.6 }}>
        Este é um parágrafo de exemplo usando a fonte do corpo e a cor de texto definidas no tema.
        Ajuste cores e fontes ao lado e veja o resultado em tempo real.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button
          style={{
            background: `linear-gradient(135deg, ${t.cor_primaria}, ${t.cor_primaria_hover})`,
            color: "#fff",
            padding: "12px 24px",
            borderRadius: t.radius_px,
            border: "none",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: t.fonte_corpo,
          }}
        >
          Botão primário
        </button>
        <button
          style={{
            background: "transparent",
            color: t.cor_texto,
            border: `1px solid ${t.cor_texto}33`,
            padding: "12px 24px",
            borderRadius: t.radius_px,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: t.fonte_corpo,
          }}
        >
          Botão secundário
        </button>
      </div>
      <div
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: t.radius_px,
          background: `${eyebrow}1A`,
          color: eyebrow,
          fontSize: 14,
        }}
      >
        Card de destaque usando o tom de eyebrow.
      </div>
    </div>
  );
}

export function TemaManager() {
  const [form, setForm] = useState<Form>(TEMA_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_tema")
        .select("*")
        .eq("id", "singleton")
        .maybeSingle();
      if (error) console.error(error);
      if (data) {
        const { id: _id, updated_at: _u, ...rest } = data as Record<string, unknown>;
        const merged: Form = { ...TEMA_DEFAULTS };
        for (const k of Object.keys(merged) as (keyof Form)[]) {
          const v = (rest as Partial<Form>)[k];
          if (v !== undefined && v !== null && v !== "") (merged as any)[k] = v;
        }
        setForm(merged);
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const payload = { id: "singleton", ...form, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("site_tema").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("Erro ao salvar tema");
      return;
    }
    invalidateCmsCache("tema");
    toast.success("Tema salvo. Recarregue o site público para ver as mudanças.");
  }

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cores da marca</h2>
          <ColorField
            label="Cor primária"
            value={form.cor_primaria}
            onChange={(v) => setForm((f) => ({ ...f, cor_primaria: v ?? TEMA_DEFAULTS.cor_primaria }))}
            presets={["#D67F43", "#2563EB", "#0EA5E9", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B", "#0F172A"]}
            helperText="Usada em botões, links de destaque e gradientes."
          />
          <ColorField
            label="Cor primária (hover)"
            value={form.cor_primaria_hover}
            onChange={(v) => setForm((f) => ({ ...f, cor_primaria_hover: v ?? TEMA_DEFAULTS.cor_primaria_hover }))}
            presets={["#C4682E", "#1D4ED8", "#0284C7", "#059669", "#7C3AED", "#DC2626", "#D97706", "#020617"]}
            helperText="Tom mais escuro para o estado de hover dos botões."
          />
          <ColorField
            label="Cor secundária (opcional)"
            value={form.cor_secundaria}
            onChange={(v) => setForm((f) => ({ ...f, cor_secundaria: v }))}
            presets={["#FBCF9E", "#FDE68A", "#A7F3D0", "#BAE6FD", "#DDD6FE"]}
            helperText="Usada como segunda cor em gradientes. Em branco, usa a primária."
          />
          <ColorField
            label="Tom de eyebrow / acentos"
            value={form.cor_eyebrow}
            onChange={(v) => setForm((f) => ({ ...f, cor_eyebrow: v }))}
            presets={["#D67F43", "#2563EB", "#10B981", "#8B5CF6"]}
            helperText="Cor de etiquetas, eyebrows e ícones pequenos. Em branco, usa a primária."
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Texto e fundo</h2>
          <ColorField
            label="Cor do texto base"
            value={form.cor_texto}
            onChange={(v) => setForm((f) => ({ ...f, cor_texto: v ?? TEMA_DEFAULTS.cor_texto }))}
            presets={["#1A1A1A", "#0F172A", "#1F2937", "#374151"]}
          />
          <ColorField
            label="Cor de fundo do site"
            value={form.cor_fundo}
            onChange={(v) => setForm((f) => ({ ...f, cor_fundo: v ?? TEMA_DEFAULTS.cor_fundo }))}
            presets={["#FFFFFF", "#F8FAFC", "#FEF3E8", "#0F172A"]}
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipografia</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fonte dos títulos</Label>
              <Select value={form.fonte_titulos} onValueChange={(v) => setForm((f) => ({ ...f, fonte_titulos: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fonte do corpo</Label>
              <Select value={form.fonte_corpo} onValueChange={(v) => setForm((f) => ({ ...f, fonte_corpo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            As fontes precisam estar carregadas no site (atualmente carregamos a família Inter via Google Fonts). Para usar uma fonte diferente, adicione-a no &lt;head&gt; ou peça para o suporte incluir.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cantos arredondados</h2>
          <div className="flex items-center gap-4">
            <Slider min={0} max={28} step={1} value={[form.radius_px]} onValueChange={([v]) => setForm((f) => ({ ...f, radius_px: v }))} className="flex-1" />
            <span className="w-16 text-right font-mono text-sm">{form.radius_px}px</span>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
            {saving ? "Salvando…" : "Salvar tema"}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <PreviewFrame height={620} mobileHeight={760}>
          <ThemePreview t={form} />
        </PreviewFrame>
        <p className="mt-2 text-xs text-muted-foreground">
          Prévia ao vivo. Após salvar, as mudanças aparecem em todas as páginas do site público que não tenham cor própria configurada (overrides de bloco têm precedência).
        </p>
      </div>
    </div>
  );
}