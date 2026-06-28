import { useEffect, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, X, Eye, EyeOff,
  LayoutTemplate, Image as ImageIcon, Grid3x3, AlertCircle, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import {
  fetchSecoes, invalidateCmsCache,
  type SiteSecao, type SiteSecaoItem, type SecaoTipo,
} from "@/lib/cms";
import { DynamicSection } from "@/components/site/sections/dynamic/DynamicSection";
import { useLayoutEffect } from "react";

type ItemForm = { id?: string; titulo: string; descricao: string; icone: string };

type FormState = {
  id?: string;
  tipo: SecaoTipo;
  eyebrow: string;
  titulo: string;
  descricao: string;
  descricao_extra: string;
  imagem_url: string | null;
  cta_texto: string;
  cta_link: string;
  bg_style: string;
  enabled: boolean;
  itens: ItemForm[];
};

const empty: FormState = {
  tipo: "texto-imagem-esquerda",
  eyebrow: "",
  titulo: "",
  descricao: "",
  descricao_extra: "",
  imagem_url: null,
  cta_texto: "",
  cta_link: "",
  bg_style: "branco",
  enabled: true,
  itens: [],
};

const TIPOS: { value: SecaoTipo; label: string; desc: string; Icon: any }[] = [
  { value: "texto-imagem-esquerda", label: "Imagem à esquerda", desc: "Texto à direita, imagem grande à esquerda.", Icon: ImageIcon },
  { value: "texto-imagem-direita", label: "Imagem à direita", desc: "Texto à esquerda, imagem grande à direita.", Icon: LayoutTemplate },
  { value: "grade-cards", label: "Grade de cards", desc: "Imagem + texto + cards (ícones).", Icon: Grid3x3 },
];

const ICONES_SUGERIDOS = [
  "BookOpen", "Heart", "Brain", "TrendingDown", "Sparkles", "Star",
  "Users", "Calendar", "Smile", "Shield", "Sun", "Award",
];

/** Lista somente os ERROS bloqueantes do formulário (avisos ficam de fora). */
function computeBlockingErrors(form: FormState): string[] {
  const errors: string[] = [];
  if (!form.titulo.trim() && !form.eyebrow.trim()) {
    errors.push("Informe um título ou uma etiqueta.");
  }
  if (form.tipo !== "grade-cards" && !form.imagem_url) {
    errors.push("Este modelo exige uma imagem ao lado do texto.");
  }
  if (form.cta_texto.trim() && !form.cta_link.trim()) {
    errors.push("Botão sem link: preencha o link ou remova o texto do botão.");
  }
  if (!form.cta_texto.trim() && form.cta_link.trim()) {
    errors.push("Link do botão sem texto: preencha o texto ou remova o link.");
  }
  return errors;
}

export function SecoesManager() {
  const [items, setItems] = useState<SiteSecao[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pickTipo, setPickTipo] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(0.45);

  useLayoutEffect(() => {
    if (!open) return;
    function recompute() {
      const w = previewWrapRef.current?.clientWidth ?? 0;
      if (w > 0) setPreviewScale(Math.min(1, w / 1280));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [open]);

  const previewSecao: SiteSecao = {
    id: form.id ?? "preview",
    tipo: form.tipo,
    eyebrow: form.eyebrow || null,
    titulo: form.titulo || null,
    descricao: form.descricao || null,
    descricao_extra: form.descricao_extra || null,
    imagem_url: publicImageUrl(form.imagem_url) ?? null,
    cta_texto: form.cta_texto || null,
    cta_link: form.cta_link || null,
    bg_style: form.bg_style,
    order: 0,
    enabled: form.enabled,
    itens: form.itens.map((it, idx) => ({
      id: it.id ?? `prev-${idx}`,
      secao_id: form.id ?? "preview",
      titulo: it.titulo || "Item",
      descricao: it.descricao || null,
      icone: it.icone || "Sparkles",
      order: idx,
    })),
  };

  async function load() {
    setLoading(true);
    invalidateCmsCache("secoes");
    const data = await fetchSecoes(true);
    // Re-fetch raw paths for editing (publicImageUrl converts paths to URLs in fetchSecoes)
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function openNew(tipo: SecaoTipo) {
    setForm({ ...empty, tipo });
    setPickTipo(false);
    setOpen(true);
  }

  async function openEdit(s: SiteSecao) {
    // Need raw image path, not the public URL — re-read the row
    const { data } = await supabase.from("site_secoes").select("imagem_url").eq("id", s.id).maybeSingle();
    setForm({
      id: s.id,
      tipo: s.tipo,
      eyebrow: s.eyebrow ?? "",
      titulo: s.titulo ?? "",
      descricao: s.descricao ?? "",
      descricao_extra: s.descricao_extra ?? "",
      imagem_url: (data?.imagem_url as string | null) ?? null,
      cta_texto: s.cta_texto ?? "",
      cta_link: s.cta_link ?? "",
      bg_style: s.bg_style ?? "branco",
      enabled: s.enabled,
      itens: s.itens.map((it) => ({
        id: it.id, titulo: it.titulo, descricao: it.descricao ?? "", icone: it.icone ?? "Sparkles",
      })),
    });
    setOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `secoes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET).upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) return toast.error("Falha no upload: " + error.message);
    setForm((f) => ({ ...f, imagem_url: path }));
    toast.success("Imagem enviada");
  }

  async function save() {
    if (!form.titulo.trim() && !form.eyebrow.trim()) return toast.error("Informe pelo menos um título");
    setSaving(true);
    const payload = {
      tipo: form.tipo,
      eyebrow: form.eyebrow.trim() || null,
      titulo: form.titulo.trim() || null,
      descricao: form.descricao.trim() || null,
      descricao_extra: form.descricao_extra.trim() || null,
      imagem_url: form.imagem_url,
      cta_texto: form.cta_texto.trim() || null,
      cta_link: form.cta_link.trim() || null,
      bg_style: form.bg_style,
      enabled: form.enabled,
      updated_at: new Date().toISOString(),
    };

    let secaoId = form.id;
    if (secaoId) {
      const { error } = await supabase.from("site_secoes").update(payload).eq("id", secaoId);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      const nextOrder = items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;
      const { data, error } = await supabase
        .from("site_secoes").insert({ ...payload, order: nextOrder }).select("id").single();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "Erro"); }
      secaoId = data.id as string;
    }

    // Sync filhos: estratégia simples — apaga tudo e reinsere
    if (form.tipo === "grade-cards") {
      await supabase.from("site_secao_itens").delete().eq("secao_id", secaoId);
      if (form.itens.length > 0) {
        const rows = form.itens.map((it, idx) => ({
          secao_id: secaoId,
          titulo: it.titulo.trim() || "Item",
          descricao: it.descricao.trim() || null,
          icone: it.icone || "Sparkles",
          order: idx,
        }));
        const { error } = await supabase.from("site_secao_itens").insert(rows);
        if (error) { setSaving(false); return toast.error("Itens: " + error.message); }
      }
    }

    setSaving(false);
    toast.success("Seção salva");
    setOpen(false);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Remover esta seção e seus itens?")) return;
    await supabase.from("site_secao_itens").delete().eq("secao_id", id);
    const { error } = await supabase.from("site_secoes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removida");
    void load();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const a = items[idx], b = items[swap];
    const r1 = await supabase.from("site_secoes").update({ order: b.order }).eq("id", a.id);
    const r2 = await supabase.from("site_secoes").update({ order: a.order }).eq("id", b.id);
    if (r1.error || r2.error) return toast.error("Falha ao reordenar");
    void load();
  }

  async function toggleEnabled(s: SiteSecao) {
    const { error } = await supabase.from("site_secoes").update({ enabled: !s.enabled }).eq("id", s.id);
    if (error) return toast.error(error.message);
    void load();
  }

  function addItem() {
    setForm((f) => ({ ...f, itens: [...f.itens, { titulo: "", descricao: "", icone: "Sparkles" }] }));
  }
  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setForm((f) => ({ ...f, itens: f.itens.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  }
  function removeItem(idx: number) {
    setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }));
  }
  function moveItem(idx: number, dir: -1 | 1) {
    const swap = idx + dir;
    setForm((f) => {
      if (swap < 0 || swap >= f.itens.length) return f;
      const arr = f.itens.slice();
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return { ...f, itens: arr };
    });
  }

  const tipoLabel = (t: SecaoTipo) => TIPOS.find((x) => x.value === t)?.label ?? t;

  // ---- Validação (resumo + por campo) ----
  type Issue = { level: "error" | "warning"; msg: string };
  type FieldKey =
    | "imagem" | "eyebrow" | "titulo" | "descricao"
    | "cta_texto" | "cta_link" | "itens";
  const fieldIssues: Record<FieldKey, Issue | null> = {
    imagem: null, eyebrow: null, titulo: null, descricao: null,
    cta_texto: null, cta_link: null, itens: null,
  };
  const itemIssues: Record<number, Issue | null> = {};
  const summary: Issue[] = [];

  const tituloVazio = !form.titulo.trim();
  const eyebrowVazio = !form.eyebrow.trim();
  if (tituloVazio && eyebrowVazio) {
    const msg = "Informe um título ou uma etiqueta.";
    fieldIssues.titulo = { level: "error", msg };
    fieldIssues.eyebrow = { level: "error", msg };
    summary.push({ level: "error", msg: "Informe um título ou uma etiqueta — a seção precisa de pelo menos um deles." });
  } else if (tituloVazio) {
    fieldIssues.titulo = { level: "warning", msg: "Sem título: a seção fica apenas com a etiqueta laranja." };
    summary.push({ level: "warning", msg: "Sem título principal: a seção fica apenas com a etiqueta laranja." });
  }
  if (!form.descricao.trim()) {
    fieldIssues.descricao = { level: "warning", msg: "Sem descrição: o texto da seção ficará vazio." };
    summary.push({ level: "warning", msg: "Sem descrição: o texto da seção ficará vazio." });
  }
  if (form.tipo !== "grade-cards" && !form.imagem_url) {
    fieldIssues.imagem = { level: "error", msg: "Imagem obrigatória neste modelo." };
    summary.push({ level: "error", msg: "Este modelo exige uma imagem ao lado do texto." });
  }
  if (form.tipo === "grade-cards" && !form.imagem_url && form.itens.length === 0) {
    fieldIssues.itens = { level: "warning", msg: "Adicione uma imagem ou pelo menos um card." };
    summary.push({ level: "warning", msg: "Sem imagem e sem cards — adicione pelo menos um para a seção ter conteúdo." });
  }
  if (form.cta_texto.trim() && !form.cta_link.trim()) {
    fieldIssues.cta_link = { level: "error", msg: "Preencha o link ou remova o texto do botão." };
    summary.push({ level: "error", msg: "Botão sem link: preencha o link ou remova o texto do botão." });
  }
  if (!form.cta_texto.trim() && form.cta_link.trim()) {
    fieldIssues.cta_texto = { level: "error", msg: "Preencha o texto ou remova o link do botão." };
    summary.push({ level: "error", msg: "Link do botão sem texto: preencha o texto ou remova o link." });
  }
  if (form.tipo === "grade-cards") {
    form.itens.forEach((it, i) => {
      if (!it.titulo.trim()) {
        itemIssues[i] = { level: "warning", msg: "Card sem título." };
        summary.push({ level: "warning", msg: `Card ${i + 1} sem título.` });
      }
    });
  }
  if (!form.enabled) {
    summary.push({ level: "warning", msg: "Seção marcada como oculta — não aparecerá na Home até ser reativada." });
  }
  const issues = summary;
  const hasErrors = issues.some((i) => i.level === "error");

  function FieldMsg({ issue }: { issue: Issue | null }) {
    if (!issue) return null;
    const cls = issue.level === "error"
      ? "text-red-600 dark:text-red-400"
      : "text-amber-600 dark:text-amber-400";
    const Icon = issue.level === "error" ? AlertCircle : AlertTriangle;
    return (
      <p className={`mt-1 flex items-start gap-1.5 text-xs ${cls}`}>
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{issue.msg}</span>
      </p>
    );
  }
  const errBorder = "border-red-400 focus-visible:ring-red-400";
  const warnBorder = "border-amber-400 focus-visible:ring-amber-400";
  function fieldCls(issue: Issue | null) {
    if (!issue) return "";
    return issue.level === "error" ? errBorder : warnBorder;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} seção{items.length !== 1 ? "es" : ""} cadastrada{items.length !== 1 ? "s" : ""}.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Estas seções aparecem na Home, entre o banner e a equipe, na ordem definida abaixo.
          </p>
        </div>
        <Button onClick={() => setPickTipo(true)} className="bg-[#D67F43] hover:bg-[#B85A24]">
          <Plus className="mr-2 h-4 w-4" /> Nova seção
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhuma seção cadastrada. Clique em <strong>Nova seção</strong> para criar.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#FEF3E8]">
                {s.imagem_url ? (
                  <img src={s.imagem_url} alt={s.titulo ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-[#D67F43]">
                    sem img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.titulo || s.eyebrow || "(sem título)"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {tipoLabel(s.tipo)} · {s.itens.length} item(s)
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(s.id, -1)} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(s.id, 1)} disabled={idx === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => toggleEnabled(s)} title={s.enabled ? "Ocultar" : "Mostrar"}>
                  {s.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seletor de template */}
      <Dialog open={pickTipo} onOpenChange={setPickTipo}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Escolha um modelo</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                onClick={() => openNew(t.value)}
                className="flex items-start gap-3 rounded-xl border border-border p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FEF3E8] text-[#D67F43]">
                  <t.Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form principal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editar seção" : "Nova seção"} — {tipoLabel(form.tipo)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
            <div className="space-y-2">
              <Label>Imagem da seção</Label>
              <div className="flex items-center gap-4">
                <div className={`h-24 w-32 overflow-hidden rounded-lg bg-[#FEF3E8] ${fieldIssues.imagem ? (fieldIssues.imagem.level === "error" ? "ring-2 ring-red-400" : "ring-2 ring-amber-400") : ""}`}>
                  {form.imagem_url ? (
                    <img src={publicImageUrl(form.imagem_url) ?? ""} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">sem imagem</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
                    const f = e.target.files?.[0]; if (f) void handleUpload(f); e.target.value = "";
                  }} />
                  <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload className="mr-2 h-4 w-4" />{uploading ? "Enviando…" : "Enviar imagem"}
                  </Button>
                  {form.imagem_url && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setForm((f) => ({ ...f, imagem_url: null }))}>
                      <X className="mr-2 h-4 w-4" /> Remover
                    </Button>
                  )}
                </div>
              </div>
              <FieldMsg issue={fieldIssues.imagem} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Etiqueta (laranja, em cima do título)</Label>
                <Input className={fieldCls(fieldIssues.eyebrow)} value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="Nossa abordagem" />
                <FieldMsg issue={fieldIssues.eyebrow} />
              </div>
              <div className="space-y-2">
                <Label>Fundo</Label>
                <Select value={form.bg_style} onValueChange={(v) => setForm({ ...form, bg_style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branco">Branco</SelectItem>
                    <SelectItem value="gradiente">Cinza suave (gradiente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input className={fieldCls(fieldIssues.titulo)} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <FieldMsg issue={fieldIssues.titulo} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={4} className={fieldCls(fieldIssues.descricao)} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <FieldMsg issue={fieldIssues.descricao} />
            </div>
            <div className="space-y-2">
              <Label>Parágrafo extra (opcional)</Label>
              <Textarea rows={3} value={form.descricao_extra} onChange={(e) => setForm({ ...form, descricao_extra: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Botão — texto (opcional)</Label>
                <Input className={fieldCls(fieldIssues.cta_texto)} value={form.cta_texto} onChange={(e) => setForm({ ...form, cta_texto: e.target.value })} />
                <FieldMsg issue={fieldIssues.cta_texto} />
              </div>
              <div className="space-y-2">
                <Label>Botão — link</Label>
                <Input className={fieldCls(fieldIssues.cta_link)} value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="https://wa.me/..." />
                <FieldMsg issue={fieldIssues.cta_link} />
              </div>
            </div>

            {form.tipo === "grade-cards" && (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cards / itens</p>
                    <p className="text-xs text-muted-foreground">Cada card mostra um ícone, título e descrição curta.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-4 w-4" /> Item</Button>
                </div>
                <FieldMsg issue={fieldIssues.itens} />
                {form.itens.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum item ainda.</p>
                ) : (
                  form.itens.map((it, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
                        <Input className={fieldCls(itemIssues[idx] ?? null)} value={it.titulo} onChange={(e) => updateItem(idx, { titulo: e.target.value })} placeholder="Título do card" />
                        <Select value={it.icone} onValueChange={(v) => updateItem(idx, { icone: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ICONES_SUGERIDOS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <FieldMsg issue={itemIssues[idx] ?? null} />
                      <Textarea rows={2} value={it.descricao} onChange={(e) => updateItem(idx, { descricao: e.target.value })} placeholder="Descrição (opcional)" />
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => moveItem(idx, -1)} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => moveItem(idx, 1)} disabled={idx === form.itens.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Visível no site</p>
                <p className="text-xs text-muted-foreground">Desligue para ocultar sem apagar.</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Prévia em tempo real</Label>
                <span className="text-xs text-muted-foreground">
                  Como aparecerá na Home
                </span>
              </div>
              {/* Painel de validação */}
              <div
                className={
                  "rounded-xl border p-3 text-sm " +
                  (hasErrors
                    ? "border-red-300 bg-red-50 dark:bg-red-950/30"
                    : issues.length > 0
                      ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                      : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30")
                }
              >
                {issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Tudo certo — pronto para publicar.</span>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {issues.map((it, i) => (
                      <li
                        key={i}
                        className={
                          "flex items-start gap-2 " +
                          (it.level === "error"
                            ? "text-red-700 dark:text-red-300"
                            : "text-amber-700 dark:text-amber-300")
                        }
                      >
                        {it.level === "error" ? (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        <span>{it.msg}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div
                ref={previewWrapRef}
                className="overflow-hidden rounded-xl border border-border bg-white"
                style={{ height: Math.round(720 * previewScale) }}
              >
                <div
                  className="pointer-events-none origin-top-left"
                  style={{
                    width: 1280,
                    transform: `scale(${previewScale})`,
                  }}
                  key={`${form.tipo}-${form.imagem_url ?? "x"}`}
                >
                  <DynamicSection secao={previewSecao} />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                A prévia atualiza automaticamente conforme você edita os campos.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={save}
              disabled={saving || hasErrors}
              title={hasErrors ? "Corrija os erros indicados na prévia antes de salvar." : undefined}
              className="bg-[#D67F43] hover:bg-[#B85A24]"
            >
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}