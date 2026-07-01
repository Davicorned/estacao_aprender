import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Save, Upload, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DOC_ESTILO_DEFAULTS,
  HEADER_ESTILO_OPTIONS,
  fetchDocumentoEstilo,
  saveDocumentoEstilo,
  invalidateDocumentoEstiloCache,
  type DocumentoEstilo,
  type HeaderEstilo,
} from "@/lib/documento-estilo";
import { fetchClinica, type ClinicaConfig } from "@/lib/configuracoes";
import { buildHeaderHtml, buildFooterHtml, getContentMetrics, measureContentTop, PAGE_W, PAGE_H } from "@/lib/documento-pdf";
import { ColorField } from "@/components/gestao/site/ColorField";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";

const BRAND_PRESETS = ["#E08A3C", "#D67F43", "#C4682E", "#B85A24", "#0F766E", "#1E3A8A", "#111827"];
const TEXT_PRESETS = ["#FFFFFF", "#1a1a1a", "#F5F5F5"];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
};

export function DocumentoEstiloDialog({ open, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState<DocumentoEstilo>(DOC_ESTILO_DEFAULTS);
  const [clinica, setClinica] = useState<ClinicaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      const [d, c] = await Promise.all([
        fetchDocumentoEstilo(true).catch(() => DOC_ESTILO_DEFAULTS),
        fetchClinica().catch(() => null),
      ]);
      setForm(d);
      setClinica(c);
      setLoading(false);
    })();
  }, [open]);

  function set<K extends keyof DocumentoEstilo>(k: K, v: DocumentoEstilo[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `documentos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) return toast.error("Falha no upload: " + error.message);
    set("logo_url", path);
    toast.success("Logo enviado");
  }

  async function save() {
    setSaving(true);
    try {
      const saved = await saveDocumentoEstilo(form);
      invalidateDocumentoEstiloCache();
      setForm(saved);
      toast.success("Estilo salvo");
      onSaved?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const logoSrc = useMemo(() => (form.logo_url ? publicImageUrl(form.logo_url) : null), [form.logo_url]);

  function fillFromClinica() {
    if (!clinica) return toast.info("Sem dados da clínica cadastrados");
    setForm((f) => ({
      ...f,
      rodape_telefone: clinica.telefone ?? f.rodape_telefone,
      rodape_endereco: clinica.endereco ?? f.rodape_endereco,
    }));
    toast.success("Dados da clínica copiados");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#D67F43]" />
            Estilo do PDF
          </DialogTitle>
          <DialogDescription>
            Cabeçalho, cores, logo e rodapé aplicados a todos os documentos gerados.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">Carregando…</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(460px,560px)]">
            <div className="space-y-6 min-w-0">
              {/* Logo */}
              <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
                <legend className="px-1 text-sm font-medium text-gray-700">Logo</legend>
                <div className="flex items-start gap-4">
                  <div className="flex h-24 w-40 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 overflow-hidden">
                    {logoSrc ? (
                      <img src={logoSrc} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400">Sem logo (usa padrão)</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void handleUpload(f);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Enviar logo
                    </Button>
                    {form.logo_url && (
                      <Button variant="ghost" size="sm" onClick={() => set("logo_url", null)}>
                        Remover
                      </Button>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Label className="text-xs text-gray-600">Alinhamento</Label>
                      <select
                        className="h-8 rounded border border-input bg-transparent px-2 text-sm"
                        value={form.logo_alinhamento}
                        onChange={(e) => set("logo_alinhamento", e.target.value as any)}
                      >
                        <option value="esquerda">Esquerda</option>
                        <option value="centro">Centro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Estilo do cabeçalho */}
              <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
                <legend className="px-1 text-sm font-medium text-gray-700">Estilo do cabeçalho</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {HEADER_ESTILO_OPTIONS.map((opt) => {
                    const selected = form.header_estilo === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set("header_estilo", opt.value)}
                        className={`group flex flex-col overflow-hidden rounded-lg border text-left transition ${selected ? "border-[#D67F43] ring-2 ring-[#D67F43]/40" : "border-gray-200 hover:border-gray-300"}`}
                        title={opt.hint}
                      >
                        <HeaderMiniPreview
                          estilo={opt.value}
                          cor={form.header_cor}
                          cor2={form.header_cor_2}
                          texto={form.header_texto_cor}
                        />
                        <div className="p-2">
                          <div className={`text-xs font-medium ${selected ? "text-[#B85A24]" : "text-gray-700"}`}>{opt.label}</div>
                          <div className="text-[10px] text-gray-400 line-clamp-1">{opt.hint}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Cores */}
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField
                  label="Cor do cabeçalho"
                  value={form.header_cor}
                  onChange={(v) => set("header_cor", v || DOC_ESTILO_DEFAULTS.header_cor)}
                  allowGradient
                  value2={form.header_cor_2}
                  onChange2={(v) => set("header_cor_2", v)}
                  presets={BRAND_PRESETS}
                />
                <ColorField
                  label="Cor do texto do cabeçalho"
                  value={form.header_texto_cor}
                  onChange={(v) => set("header_texto_cor", v || "#FFFFFF")}
                  presets={TEXT_PRESETS}
                />
              </div>

              {/* Tagline */}
              <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
                <legend className="px-1 text-sm font-medium text-gray-700">Tagline</legend>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mostrar tagline no cabeçalho</span>
                  <Switch checked={form.mostrar_tagline} onCheckedChange={(v) => set("mostrar_tagline", v)} />
                </div>
                {form.mostrar_tagline && (
                  <Textarea
                    rows={2}
                    value={form.tagline ?? ""}
                    onChange={(e) => set("tagline", e.target.value)}
                    placeholder="Ex.: Psicopedagogia · Psicologia · …"
                  />
                )}
              </fieldset>

              {/* Rodapé */}
              <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
                <legend className="px-1 text-sm font-medium text-gray-700">Rodapé</legend>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mostrar rodapé</span>
                  <Switch checked={form.rodape_mostrar} onCheckedChange={(v) => set("rodape_mostrar", v)} />
                </div>
                {form.rodape_mostrar && (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">📞 Telefone</Label>
                        <Input
                          value={form.rodape_telefone ?? ""}
                          onChange={(e) => set("rodape_telefone", e.target.value || null)}
                          placeholder={clinica?.telefone ?? "Vazio = usar telefone da clínica"}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">📷 Instagram</Label>
                        <Input
                          value={form.rodape_instagram ?? ""}
                          onChange={(e) => set("rodape_instagram", e.target.value || null)}
                          placeholder="@sua_clinica"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs">📍 Endereço</Label>
                        <Input
                          value={form.rodape_endereco ?? ""}
                          onChange={(e) => set("rodape_endereco", e.target.value || null)}
                          placeholder={clinica?.endereco ?? "Vazio = usar endereço da clínica"}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500">
                        Campos vazios usam o valor de Configurações › Clínica.
                      </p>
                      <Button variant="outline" size="sm" onClick={fillFromClinica}>
                        Preencher com dados da clínica
                      </Button>
                    </div>
                    <ColorField
                      label="Cor do rodapé"
                      value={form.rodape_cor}
                      onChange={(v) => set("rodape_cor", v)}
                      helperText="Vazio = mesma cor do cabeçalho"
                      presets={BRAND_PRESETS}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Numeração de páginas</span>
                      <Switch checked={form.mostrar_paginacao} onCheckedChange={(v) => set("mostrar_paginacao", v)} />
                    </div>
                  </>
                )}
              </fieldset>
            </div>

            {/* Prévia */}
            <div className="min-w-0 lg:sticky lg:top-2 lg:self-start">
              <div className="space-y-2">
                <div className="text-xs text-gray-500">Prévia (A4)</div>
                <PagePreview cfg={form} clinica={clinica} logoSrc={logoSrc} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={save} disabled={saving || loading} className="bg-[#D67F43] hover:bg-[#B85A24]">
            <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeaderMiniPreview({
  estilo, cor, cor2, texto,
}: { estilo: HeaderEstilo; cor: string; cor2: string | null; texto: string }) {
  const bg = cor2 ? `linear-gradient(135deg, ${cor}, ${cor2})` : cor;
  return (
    <div className="relative h-16 w-full bg-white">
      {estilo === "curva" && (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0,0 L100,0 L100,26 C80,38 60,32 40,28 C25,25 10,32 0,28 Z" fill={bg as any} />
        </svg>
      )}
      {estilo === "barra" && <div className="absolute inset-x-0 top-0 h-6" style={{ background: bg }} />}
      {estilo === "linha" && <div className="absolute inset-x-2 top-6 h-[2px] rounded" style={{ background: bg }} />}
      {estilo === "timbrado" && (
        <>
          <div className="absolute left-1/2 top-2 h-4 w-10 -translate-x-1/2 rounded" style={{ background: bg }} />
          <div className="absolute inset-x-4 top-9 h-[1px]" style={{ background: bg }} />
        </>
      )}
      {estilo === "faixa-lateral" && <div className="absolute inset-y-0 left-0 w-2" style={{ background: bg }} />}
      {estilo === "canto" && (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <polygon points="0,0 55,0 0,40" fill={bg as any} />
        </svg>
      )}
      {estilo === "moldura" && <div className="absolute inset-1 border" style={{ borderColor: cor }} />}
      {estilo === "nenhum" && (
        <div className="absolute inset-0 flex items-start p-2">
          <div className="h-3 w-8 rounded bg-gray-300" />
        </div>
      )}
      <div className="absolute inset-x-3 bottom-2 space-y-[3px]">
        <div className="h-[3px] w-3/4 rounded bg-gray-200" />
        <div className="h-[3px] w-2/3 rounded bg-gray-200" />
      </div>
      <span className="sr-only" style={{ color: texto }} />
    </div>
  );
}

function PagePreview({
  cfg, clinica, logoSrc,
}: { cfg: DocumentoEstilo; clinica: ClinicaConfig | null; logoSrc: string | null }) {
  const header = useMemo(() => buildHeaderHtml(cfg, { logoSrc, clinica }), [cfg, logoSrc, clinica]);
  const footer = useMemo(
    () => buildFooterHtml(cfg, { logoSrc, clinica, pageNum: 1, total: 3 }),
    [cfg, logoSrc, clinica],
  );
  const metrics = useMemo(() => getContentMetrics(cfg), [cfg]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const compute = () => {
      const w = el.clientWidth || PAGE_W * 0.6;
      setScale(Math.min(0.72, Math.max(0.35, w / PAGE_W)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure brand block bottom → topo do conteúdo. Recalcula em qualquer
  // mudança de config (tagline, logo, modelo, altura).
  const pageRef = useRef<HTMLDivElement>(null);
  const [contentTop, setContentTop] = useState(metrics.top);
  useLayoutEffect(() => {
    if (!pageRef.current) return;
    setContentTop(measureContentTop(pageRef.current, cfg, 24));
  }, [cfg, logoSrc, header, metrics.top]);

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="rounded border border-gray-300 shadow-sm bg-white mx-auto"
        style={{
          width: PAGE_W * scale,
          height: PAGE_H * scale,
          overflow: "hidden",
        }}
      >
        <div
          ref={pageRef}
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
            background: "#fff",
            fontFamily: `'${cfg.fonte}', 'Inter', system-ui, sans-serif`,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: header }} />
          <div
            style={{
              position: "absolute",
              top: contentTop,
              left: metrics.left,
              right: metrics.right,
              bottom: metrics.bottom,
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "#222",
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS
            </div>
            <p style={{ marginBottom: 10, textAlign: "justify" }}>
              Este é um exemplo de conteúdo. O texto real do contrato aparece aqui quando o
              documento é gerado. Ajuste o cabeçalho, cores e rodapé para ver como o PDF ficará
              antes de baixar.
            </p>
            <p style={{ marginBottom: 10, textAlign: "justify" }}>
              O layout do cabeçalho selecionado define o espaço reservado ao conteúdo em todas as
              páginas, e o rodapé segue o mesmo padrão.
            </p>
            <div style={{ fontWeight: 700, margin: "14px 0 6px" }}>1. DAS PARTES</div>
            <p style={{ marginBottom: 10, textAlign: "justify" }}>
              Contratante e Contratada firmam o presente instrumento nos termos abaixo descritos,
              comprometendo-se a cumprir todas as cláusulas.
            </p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: footer }} />
        </div>
      </div>
    </div>
  );
}