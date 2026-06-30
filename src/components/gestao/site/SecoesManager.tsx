import { useEffect, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, X, Eye, EyeOff,
  LayoutTemplate, Image as ImageIcon, Grid3x3, AlertCircle, AlertTriangle, CheckCircle2,
  Monitor, Smartphone, ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import {
  fetchSecoes, invalidateCmsCache,
  type SiteSecao, type SiteSecaoItem, type SecaoTipo,
} from "@/lib/cms";
import { DynamicSection } from "@/components/site/sections/dynamic/DynamicSection";
import { useLayoutEffect } from "react";
import { ColorField } from "./ColorField";

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
  bg_cor: string | null;
  bg_cor_2: string | null;
  texto_cor: string | null;
  card_bg_cor: string | null;
  card_texto_cor: string | null;
  card_borda_cor: string | null;
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
  bg_cor: null,
  bg_cor_2: null,
  texto_cor: null,
  card_bg_cor: null,
  card_texto_cor: null,
  card_borda_cor: null,
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
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"conteudo" | "midia" | "botao" | "cards" | "aparencia">("conteudo");

  useLayoutEffect(() => {
    if (!open) return;
    const targetW = previewDevice === "desktop" ? 1280 : 390;
    function recompute() {
      const w = previewWrapRef.current?.clientWidth ?? 0;
      if (w > 0) setPreviewScale(Math.min(1, w / targetW));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [open, previewDevice]);

  // Para a prévia: injeta valores-fantasma quando o campo está vazio,
  // assim você sempre vê a forma do modelo, mesmo antes de preencher.
  const ghostTitulo = form.titulo || "Título da sua seção aparece aqui";
  const ghostEyebrow = form.eyebrow || (form.titulo ? "" : "Etiqueta");
  const ghostDescricao = form.descricao
    || "Descrição da seção aparece aqui — escreva alguns parágrafos para apresentar o conteúdo aos visitantes da Home.";
  const previewSecao: SiteSecao = {
    id: form.id ?? "preview",
    tipo: form.tipo,
    eyebrow: ghostEyebrow || null,
    titulo: ghostTitulo,
    descricao: ghostDescricao,
    descricao_extra: form.descricao_extra || null,
    imagem_url: publicImageUrl(form.imagem_url) ?? null,
    cta_texto: form.cta_texto || (form.cta_link ? "Botão" : null),
    cta_link: form.cta_link || (form.cta_texto ? "#" : null),
    bg_style: form.bg_style,
    bg_cor: form.bg_cor,
    bg_cor_2: form.bg_cor_2,
    texto_cor: form.texto_cor,
    card_bg_cor: form.card_bg_cor,
    card_texto_cor: form.card_texto_cor,
    card_borda_cor: form.card_borda_cor,
    order: 0,
    enabled: form.enabled,
    itens: (form.tipo === "grade-cards" && form.itens.length === 0
      ? [
          { titulo: "Card de exemplo 1", descricao: "Descrição curta do card.", icone: "Sparkles" },
          { titulo: "Card de exemplo 2", descricao: "Descrição curta do card.", icone: "Heart" },
          { titulo: "Card de exemplo 3", descricao: "Descrição curta do card.", icone: "Star" },
        ]
      : form.itens
    ).map((it, idx) => ({
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
      bg_cor: s.bg_cor ?? null,
      bg_cor_2: s.bg_cor_2 ?? null,
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
    // Guarda dura: revalida antes de qualquer escrita, mesmo se a UI deixar escapar.
    const errors = computeBlockingErrors(form);
    if (errors.length > 0) {
      toast.error(errors[0], {
        description: errors.length > 1 ? `+${errors.length - 1} outro(s) erro(s). Veja a prévia.` : undefined,
      });
      return;
    }
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
      bg_cor: form.bg_cor,
      bg_cor_2: form.bg_cor_2,
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

  // Erros por aba (somente "error" — avisos não bloqueiam)
  const tabErrors = {
    conteudo:
      (fieldIssues.eyebrow?.level === "error" ? 1 : 0) +
      (fieldIssues.titulo?.level === "error" ? 1 : 0) +
      (fieldIssues.descricao?.level === "error" ? 1 : 0),
    midia: fieldIssues.imagem?.level === "error" ? 1 : 0,
    botao:
      (fieldIssues.cta_texto?.level === "error" ? 1 : 0) +
      (fieldIssues.cta_link?.level === "error" ? 1 : 0),
    cards:
      (fieldIssues.itens?.level === "error" ? 1 : 0) +
      Object.values(itemIssues).filter((i) => i?.level === "error").length,
    aparencia: 0,
  };

  // Mini-mapa da Home: ordem real das seções fixas + dinâmicas.
  // (Mesma ordem usada em src/routes/index.tsx)
  const homeMap: { key: string; label: string; fixed: boolean; secaoId?: string; isCurrent?: boolean }[] = [
    { key: "hero", label: "Banner principal", fixed: true },
    { key: "when", label: "Quando procurar ajuda", fixed: true },
    { key: "approach", label: "Nossa abordagem", fixed: true },
    ...items.map((s) => ({
      key: s.id,
      label: s.titulo || s.eyebrow || "(sem título)",
      fixed: false,
      secaoId: s.id,
      isCurrent: s.id === form.id,
    })),
    ...(open && !form.id
      ? [{ key: "new", label: ghostTitulo || "Nova seção", fixed: false, isCurrent: true }]
      : []),
    { key: "team", label: "Nossa equipe", fixed: true },
    { key: "testimonials", label: "Depoimentos", fixed: true },
    { key: "contact", label: "Contato", fixed: true },
    { key: "footer", label: "Rodapé", fixed: true },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} seção{items.length !== 1 ? "es" : ""} cadastrada{items.length !== 1 ? "s" : ""}.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Estas seções aparecem na Home, entre <strong>Nossa abordagem</strong> e <strong>Nossa equipe</strong>, na ordem definida abaixo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Ver Home
            </a>
          </Button>
          <Button onClick={() => setPickTipo(true)} className="bg-[#D67F43] hover:bg-[#B85A24]">
            <Plus className="mr-2 h-4 w-4" /> Nova seção
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhuma seção cadastrada. Clique em <strong>Nova seção</strong> para criar.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s, idx) => {
            const tmpForm: FormState = {
              tipo: s.tipo, eyebrow: s.eyebrow ?? "", titulo: s.titulo ?? "",
              descricao: s.descricao ?? "", descricao_extra: s.descricao_extra ?? "",
              imagem_url: s.imagem_url, cta_texto: s.cta_texto ?? "",
              cta_link: s.cta_link ?? "", bg_style: s.bg_style ?? "branco",
              bg_cor: s.bg_cor ?? null, bg_cor_2: s.bg_cor_2 ?? null,
              texto_cor: s.texto_cor ?? null,
              card_bg_cor: s.card_bg_cor ?? null,
              card_texto_cor: s.card_texto_cor ?? null,
              card_borda_cor: s.card_borda_cor ?? null,
              enabled: s.enabled, itens: s.itens.map((it) => ({
                titulo: it.titulo, descricao: it.descricao ?? "", icone: it.icone ?? "Sparkles",
              })),
            };
            const errs = computeBlockingErrors(tmpForm);
            return (
              <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#FEF3E8] dark:bg-amber-950/30 relative">
                  {s.imagem_url ? (
                    <img src={s.imagem_url} alt={s.titulo ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-[#D67F43]">
                      sem imagem
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white">
                    {tipoLabel(s.tipo)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.titulo || s.eyebrow || "(sem título)"}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    {!s.enabled && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <EyeOff className="h-3.5 w-3.5" /> Oculta
                      </span>
                    )}
                    {errs.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3.5 w-3.5" /> {errs.length} erro{errs.length > 1 ? "s" : ""}
                      </span>
                    ) : s.enabled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pronta
                      </span>
                    ) : null}
                    <span className="text-muted-foreground">· {s.itens.length} item(s)</span>
                  </div>
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
            );
          })}
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
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editar seção" : "Nova seção"} — {tipoLabel(form.tipo)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            {/* ============ COLUNA: FORMULÁRIO COM ABAS ============ */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="min-w-0">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="conteudo" className="relative">
                  Conteúdo
                  {tabErrors.conteudo > 0 && <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{tabErrors.conteudo}</span>}
                </TabsTrigger>
                <TabsTrigger value="midia" className="relative">
                  Mídia
                  {tabErrors.midia > 0 && <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{tabErrors.midia}</span>}
                </TabsTrigger>
                <TabsTrigger value="botao" className="relative">
                  Botão
                  {tabErrors.botao > 0 && <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{tabErrors.botao}</span>}
                </TabsTrigger>
                <TabsTrigger value="cards" disabled={form.tipo !== "grade-cards"} className="relative">
                  Cards
                  {tabErrors.cards > 0 && <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{tabErrors.cards}</span>}
                </TabsTrigger>
                <TabsTrigger value="aparencia">Aparência</TabsTrigger>
              </TabsList>

              {/* --- CONTEÚDO --- */}
              <TabsContent value="conteudo" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Etiqueta (laranja, acima do título)</Label>
                  <Input className={fieldCls(fieldIssues.eyebrow)} value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="Ex: Nossa abordagem" />
                  <FieldMsg issue={fieldIssues.eyebrow} />
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input className={fieldCls(fieldIssues.titulo)} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Cuidamos da saúde emocional…" />
                  <FieldMsg issue={fieldIssues.titulo} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea rows={5} className={fieldCls(fieldIssues.descricao)} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Texto principal da seção." />
                  <FieldMsg issue={fieldIssues.descricao} />
                </div>
                <div className="space-y-2">
                  <Label>Parágrafo extra (opcional)</Label>
                  <Textarea rows={3} value={form.descricao_extra} onChange={(e) => setForm({ ...form, descricao_extra: e.target.value })} placeholder="Um parágrafo adicional, se quiser." />
                </div>
              </TabsContent>

              {/* --- MÍDIA --- */}
              <TabsContent value="midia" className="space-y-3 pt-4">
                <Label>Imagem da seção</Label>
                <div className="flex items-center gap-4">
                  <div className={`h-32 w-44 overflow-hidden rounded-lg bg-[#FEF3E8] dark:bg-amber-950/30 ${fieldIssues.imagem ? (fieldIssues.imagem.level === "error" ? "ring-2 ring-red-400" : "ring-2 ring-amber-400") : ""}`}>
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
                <p className="text-xs text-muted-foreground">
                  {form.tipo === "grade-cards"
                    ? "Opcional neste modelo — sem imagem, os cards ficam centralizados."
                    : "A imagem aparece ao lado do texto da seção."}
                </p>
              </TabsContent>

              {/* --- BOTÃO --- */}
              <TabsContent value="botao" className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground">Deixe ambos vazios para não exibir botão.</p>
                <div className="space-y-2">
                  <Label>Texto do botão</Label>
                  <Input className={fieldCls(fieldIssues.cta_texto)} value={form.cta_texto} onChange={(e) => setForm({ ...form, cta_texto: e.target.value })} placeholder="Ex: Agendar avaliação" />
                  <FieldMsg issue={fieldIssues.cta_texto} />
                </div>
                <div className="space-y-2">
                  <Label>Link do botão</Label>
                  <Input className={fieldCls(fieldIssues.cta_link)} value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="https://wa.me/..." />
                  <FieldMsg issue={fieldIssues.cta_link} />
                </div>
              </TabsContent>

              {/* --- CARDS --- */}
              <TabsContent value="cards" className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cards / itens</p>
                    <p className="text-xs text-muted-foreground">Cada card mostra ícone, título e descrição curta.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-4 w-4" /> Item</Button>
                </div>
                <FieldMsg issue={fieldIssues.itens} />
                {form.itens.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Nenhum card ainda. Clique em <strong>Item</strong> para adicionar.
                  </div>
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
              </TabsContent>

              {/* --- APARÊNCIA --- */}
              <TabsContent value="aparencia" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Fundo</Label>
                  <Select value={form.bg_style} onValueChange={(v) => setForm({ ...form, bg_style: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branco">Branco</SelectItem>
                      <SelectItem value="gradiente">Cinza suave (gradiente)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Estilo padrão usado se nenhuma cor personalizada for definida abaixo.
                  </p>
                </div>
                <ColorField
                  label="Cor de fundo personalizada"
                  value={form.bg_cor}
                  onChange={(v) => setForm((f) => ({ ...f, bg_cor: v }))}
                  value2={form.bg_cor_2}
                  onChange2={(v) => setForm((f) => ({ ...f, bg_cor_2: v }))}
                  allowGradient
                  presets={["#FFFFFF", "#FEF3E8", "#FDDFC4", "#F3F4F6", "#0F172A", "#D67F43"]}
                  helperText="Sobrescreve o estilo padrão. Use a paleta, um hex (#RRGGBB) ou monte um gradiente com 2 cores."
                />
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Visível no site</p>
                    <p className="text-xs text-muted-foreground">Desligue para ocultar sem apagar.</p>
                  </div>
                  <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
                </div>
              </TabsContent>
            </Tabs>

            {/* ============ COLUNA: PRÉVIA + MINI-MAPA ============ */}
            <div className="space-y-3 lg:sticky lg:top-2 lg:self-start">
              <div className="flex items-center justify-between">
                <Label>Prévia em tempo real</Label>
                <div className="inline-flex rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${previewDevice === "desktop" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Monitor className="h-3.5 w-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${previewDevice === "mobile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </button>
                </div>
              </div>

              {/* Painel de validação compacto */}
              {issues.length > 0 && (
                <div
                  className={
                    "rounded-xl border p-3 text-xs " +
                    (hasErrors
                      ? "border-red-300 bg-red-50 dark:bg-red-950/30"
                      : "border-amber-300 bg-amber-50 dark:bg-amber-950/30")
                  }
                >
                  <ul className="space-y-1">
                    {issues.slice(0, 4).map((it, i) => (
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
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{it.msg}</span>
                      </li>
                    ))}
                    {issues.length > 4 && (
                      <li className="text-muted-foreground">+ {issues.length - 4} aviso(s)…</li>
                    )}
                  </ul>
                </div>
              )}
              {issues.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tudo certo — pronto para publicar.</span>
                </div>
              )}

              {/* Frame da prévia */}
              <div
                ref={previewWrapRef}
                className={`overflow-hidden rounded-xl border border-border bg-white ${previewDevice === "mobile" ? "mx-auto max-w-[420px]" : ""}`}
                style={{ height: Math.round((previewDevice === "mobile" ? 780 : 600) * previewScale) }}
              >
                <div
                  className="pointer-events-none origin-top-left"
                  style={{
                    width: previewDevice === "desktop" ? 1280 : 390,
                    transform: `scale(${previewScale})`,
                  }}
                  key={`${form.tipo}-${form.imagem_url ?? "x"}-${previewDevice}`}
                >
                  <DynamicSection secao={previewSecao} />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Campos vazios aparecem como exemplo cinza para você visualizar o layout do modelo.
              </p>

              {/* Mini-mapa da Home */}
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium">Onde aparece na Home</p>
                <ol className="space-y-1 text-xs">
                  {homeMap.map((item) => (
                    <li
                      key={item.key}
                      className={
                        "flex items-center gap-2 rounded px-2 py-1 " +
                        (item.isCurrent
                          ? "bg-[#D67F43]/15 font-medium text-[#B85A24] dark:text-amber-300 ring-1 ring-[#D67F43]/40"
                          : item.fixed
                            ? "text-muted-foreground"
                            : "text-foreground")
                      }
                    >
                      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                      <span className="truncate">{item.label}</span>
                      {item.isCurrent && <span className="ml-auto text-[10px] uppercase tracking-wide">esta seção</span>}
                      {item.fixed && <span className="ml-auto text-[10px] uppercase tracking-wide opacity-60">fixa</span>}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button asChild variant="ghost" className="mr-auto">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Abrir Home
              </a>
            </Button>
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