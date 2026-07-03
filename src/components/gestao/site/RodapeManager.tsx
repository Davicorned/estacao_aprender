import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchRodape,
  invalidateCmsCache,
  RODAPE_DEFAULTS,
  type LinkItem,
  type RedeSocial,
  type SiteRodape,
} from "@/lib/cms";
import { PreviewFrame } from "./PreviewFrame";
import { Footer, type FooterLayout } from "@/components/site/Footer";
import { ColorField } from "./ColorField";
import { LinkField } from "./LinkField";

type Form = Omit<SiteRodape, "id">;

const initial: Form = { ...RODAPE_DEFAULTS };

const REDE_OPTS = ["instagram", "facebook", "linkedin", "youtube", "twitter", "whatsapp", "tiktok"];

const FOOTER_LAYOUT_OPTIONS: { key: FooterLayout; label: string; hint: string }[] = [
  { key: "colunas", label: "Colunas", hint: "Marca + navegação + serviços + contato" },
  { key: "compacto", label: "Compacto", hint: "Uma linha só: logo, links, redes" },
  { key: "centralizado", label: "Centralizado", hint: "Logo, links e redes no centro" },
  { key: "com-mapa", label: "Com mapa", hint: "Mini-mapa do endereço + contato" },
  { key: "duas-colunas", label: "Duas colunas", hint: "Marca + redes | links + contato" },
];

function FooterLayoutThumb({ layout }: { layout: FooterLayout }) {
  const line = "rounded-sm bg-white/40";
  const lineD = "rounded-sm bg-white/60";
  const box = "bg-white/20 rounded";
  if (layout === "colunas") {
    return (
      <div className="grid h-full w-full grid-cols-4 gap-1 bg-gray-800 p-2">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <div className={`h-1 w-full ${lineD}`} />
            <div className={`h-0.5 w-4/5 ${line}`} />
            <div className={`h-0.5 w-3/5 ${line}`} />
          </div>
        ))}
      </div>
    );
  }
  if (layout === "compacto") {
    return (
      <div className="flex h-full w-full items-center justify-between gap-1 bg-gray-800 p-2">
        <div className={`h-2 w-6 ${box}`} />
        <div className="flex gap-1">
          <div className={`h-1 w-3 ${line}`} />
          <div className={`h-1 w-3 ${line}`} />
          <div className={`h-1 w-3 ${line}`} />
        </div>
        <div className="flex gap-0.5">
          <div className="h-2 w-2 rounded-full bg-white/40" />
          <div className="h-2 w-2 rounded-full bg-white/40" />
        </div>
      </div>
    );
  }
  if (layout === "centralizado") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gray-800 p-2">
        <div className={`h-2 w-6 ${box}`} />
        <div className="flex gap-1">
          <div className={`h-1 w-3 ${line}`} />
          <div className={`h-1 w-3 ${line}`} />
          <div className={`h-1 w-3 ${line}`} />
        </div>
        <div className="flex gap-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
        </div>
      </div>
    );
  }
  if (layout === "com-mapa") {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-1 bg-gray-800 p-2">
        <div className="rounded bg-gradient-to-br from-emerald-400/60 to-sky-400/60" />
        <div className="flex flex-col gap-0.5">
          <div className={`h-1 w-full ${lineD}`} />
          <div className={`h-0.5 w-4/5 ${line}`} />
          <div className={`h-0.5 w-3/5 ${line}`} />
          <div className={`h-0.5 w-4/5 ${line}`} />
        </div>
      </div>
    );
  }
  // duas-colunas
  return (
    <div className="grid h-full w-full grid-cols-2 gap-1 bg-gray-800 p-2">
      <div className="flex flex-col gap-0.5">
        <div className={`h-2 w-6 ${box}`} />
        <div className={`h-0.5 w-full ${line}`} />
        <div className={`h-0.5 w-4/5 ${line}`} />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className={`h-1 w-full ${lineD}`} />
        <div className={`h-0.5 w-3/4 ${line}`} />
        <div className={`h-0.5 w-3/4 ${line}`} />
        <div className={`h-0.5 w-2/3 ${line}`} />
      </div>
    </div>
  );
}

export function RodapeManager() {
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      invalidateCmsCache("rodape");
      const r = await fetchRodape();
      if (r) {
        const { id: _id, ...rest } = r;
        setForm({
          ...RODAPE_DEFAULTS,
          ...rest,
          texto_institucional: rest.texto_institucional || RODAPE_DEFAULTS.texto_institucional,
          telefone: rest.telefone || RODAPE_DEFAULTS.telefone,
          telefone_link: rest.telefone_link || RODAPE_DEFAULTS.telefone_link,
          email: rest.email || RODAPE_DEFAULTS.email,
          endereco_titulo: rest.endereco_titulo || RODAPE_DEFAULTS.endereco_titulo,
          endereco_texto: rest.endereco_texto || RODAPE_DEFAULTS.endereco_texto,
          copyright: rest.copyright || RODAPE_DEFAULTS.copyright,
          redes_sociais: rest.redes_sociais?.length ? rest.redes_sociais : RODAPE_DEFAULTS.redes_sociais,
          links_rapidos: rest.links_rapidos?.length ? rest.links_rapidos : RODAPE_DEFAULTS.links_rapidos,
          links_servicos: rest.links_servicos?.length ? rest.links_servicos : RODAPE_DEFAULTS.links_servicos,
        });
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("site_rodape").upsert({
      id: "singleton",
      ...form,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    invalidateCmsCache("rodape");
    toast.success("Rodapé atualizado");
  }

  // helpers
  function updateLink(field: "links_rapidos" | "links_servicos", idx: number, patch: Partial<LinkItem>) {
    setForm((f) => ({ ...f, [field]: f[field].map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));
  }
  function addLink(field: "links_rapidos" | "links_servicos") {
    setForm((f) => ({ ...f, [field]: [...f[field], { label: "", href: "" }] }));
  }
  function removeLink(field: "links_rapidos" | "links_servicos", idx: number) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }

  function updateRede(idx: number, patch: Partial<RedeSocial>) {
    setForm((f) => ({
      ...f,
      redes_sociais: f.redes_sociais.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  }
  function addRede() {
    setForm((f) => ({ ...f, redes_sociais: [...f.redes_sociais, { tipo: "instagram", url: "" }] }));
  }
  function removeRede(idx: number) {
    setForm((f) => ({ ...f, redes_sociais: f.redes_sociais.filter((_, i) => i !== idx) }));
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
      <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Texto institucional</h2>
        <Textarea rows={3} value={form.texto_institucional ?? ""} onChange={(e) => setForm({ ...form, texto_institucional: e.target.value })} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contato</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Telefone (exibido)</Label>
            <Input value={form.telefone ?? ""} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 93213-9815" />
          </div>
          <div className="space-y-2">
            <Label>Telefone (link)</Label>
            <Input value={form.telefone_link ?? ""} onChange={(e) => setForm({ ...form, telefone_link: e.target.value })} placeholder="https://wa.me/5511…" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>E-mail</Label>
            <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Endereço — título</Label>
            <Input value={form.endereco_titulo ?? ""} onChange={(e) => setForm({ ...form, endereco_titulo: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Endereço — texto</Label>
            <Input value={form.endereco_texto ?? ""} onChange={(e) => setForm({ ...form, endereco_texto: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Redes sociais</h2>
          <Button size="sm" variant="outline" onClick={addRede}><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
        </div>
        {form.redes_sociais.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma rede social.</p>}
        {form.redes_sociais.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select value={r.tipo} onValueChange={(v) => updateRede(i, { tipo: v })}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REDE_OPTS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="flex-1" placeholder="URL completa" value={r.url} onChange={(e) => updateRede(i, { url: e.target.value })} />
            <Button size="icon" variant="ghost" onClick={() => removeRede(i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
        ))}
      </section>

      {(["links_rapidos", "links_servicos"] as const).map((field) => (
        <section key={field} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {field === "links_rapidos" ? "Coluna · Navegação" : "Coluna · Serviços"}
            </h2>
            <Button size="sm" variant="outline" onClick={() => addLink(field)}><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
          </div>
          {form[field].length === 0 && <p className="text-xs text-muted-foreground">Nenhum link.</p>}
          {form[field].map((l, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input placeholder="Rótulo" className="flex-1" value={l.label} onChange={(e) => updateLink(field, i, { label: e.target.value })} />
                <Button size="icon" variant="ghost" onClick={() => removeLink(field, i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
              <div className="min-w-0">
                <LinkField label="Destino" value={l.href ?? ""} onChange={(v) => updateLink(field, i, { href: v })} />
              </div>
            </div>
          ))}
        </section>
      ))}

      <section className="rounded-xl border border-border bg-card p-5 space-y-2">
        <Label>Texto de copyright</Label>
        <Input value={form.copyright ?? ""} onChange={(e) => setForm({ ...form, copyright: e.target.value })} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Aparência</h2>
        <ColorField
          label="Cor de fundo do rodapé"
          value={form.bg_cor}
          onChange={(v) => setForm((f) => ({ ...f, bg_cor: v }))}
          presets={["#0F172A", "#111827", "#1F2937", "#FFFFFF", "#FEF3E8", "#D67F43"]}
          helperText="Deixe em branco para usar o cinza escuro padrão."
        />
        <div className="space-y-2">
          <Label>Contraste do texto</Label>
          <Select
            value={form.texto_cor ?? "claro"}
            onValueChange={(v) => setForm({ ...form, texto_cor: v as "claro" | "escuro" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="claro">Texto claro (para fundo escuro)</SelectItem>
              <SelectItem value="escuro">Texto escuro (para fundo claro)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Use “Texto escuro” quando escolher cores de fundo claras (creme, branco) para manter a legibilidade.
          </p>
        </div>
        <ColorField
          label="Cor do texto (personalizada)"
          value={form.texto_cor_hex}
          onChange={(v) => setForm((f) => ({ ...f, texto_cor_hex: v }))}
          presets={["#FFFFFF", "#E5E7EB", "#9CA3AF", "#0F172A", "#D67F43", "#FEF3E8"]}
          helperText="Sobrescreve o contraste acima. Em branco, mantém o esquema claro/escuro."
        />
        <ColorField
          label="Cor de fundo dos blocos (cards)"
          value={form.card_bg_cor}
          onChange={(v) => setForm((f) => ({ ...f, card_bg_cor: v }))}
          presets={["#111827", "#1F2937", "#FFFFFF", "#FEF3E8", "#D67F43", "#0F172A"]}
          helperText="Aplica fundo às 4 colunas (marca, navegação, serviços, contato)."
        />
        <ColorField
          label="Cor do texto dos blocos"
          value={form.card_texto_cor}
          onChange={(v) => setForm((f) => ({ ...f, card_texto_cor: v }))}
          presets={["#FFFFFF", "#E5E7EB", "#0F172A", "#374151", "#D67F43", "#FEF3E8"]}
        />
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <PreviewFrame height={520} mobileHeight={1200}>
          <Footer override={form} />
        </PreviewFrame>
        <p className="mt-2 text-xs text-muted-foreground">
          Aparece no final de todas as páginas. Atualiza enquanto você digita.
        </p>
      </div>
    </div>
  );
}