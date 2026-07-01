import { useEffect, useMemo, useRef, useState } from "react";
import { Save, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DOC_ESTILO_DEFAULTS,
  HEADER_ESTILO_OPTIONS,
  fetchDocumentoEstilo,
  saveDocumentoEstilo,
  type DocumentoEstilo,
  type HeaderEstilo,
} from "@/lib/documento-estilo";
import { fetchClinica, type ClinicaConfig } from "@/lib/configuracoes";
import { buildHeaderHtml, buildFooterHtml, getContentMetrics, PAGE_W, PAGE_H } from "@/lib/documento-pdf";
import { ColorField } from "@/components/gestao/site/ColorField";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";

const BRAND_PRESETS = ["#E08A3C", "#D67F43", "#C4682E", "#B85A24", "#0F766E", "#1E3A8A", "#111827"];
const TEXT_PRESETS = ["#FFFFFF", "#1a1a1a", "#F5F5F5"];

export function DocumentoEstiloSection() {
  const [form, setForm] = useState<DocumentoEstilo>(DOC_ESTILO_DEFAULTS);
  const [clinica, setClinica] = useState<ClinicaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [d, c] = await Promise.all([
        fetchDocumentoEstilo(true).catch(() => DOC_ESTILO_DEFAULTS),
        fetchClinica().catch(() => null),
      ]);
      setForm(d);
      setClinica(c);
      setLoading(false);
    })();
  }, []);

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
      setForm(saved);
      toast.success("Estilo do PDF salvo");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const logoSrc = useMemo(() => (form.logo_url ? publicImageUrl(form.logo_url) : null), [form.logo_url]);

  return (
    <section id="estilo-pdf" className="rounded-xl border border-gray-200 bg-white scroll-mt-24">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Estilo do PDF</h2>
          <p className="text-xs text-gray-500">
            Cabeçalho, cores, logo e rodapé usados nos contratos e documentos.
          </p>
        </div>
        <Button onClick={save} disabled={saving || loading} className="bg-[#D67F43] hover:bg-[#B85A24]">
          <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>

      {loading ? (
        <p className="px-5 py-6 text-sm text-gray-400">Carregando…</p>
      ) : (
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_420px]">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usar dados da clínica</span>
                    <Switch checked={form.rodape_usar_clinica} onCheckedChange={(v) => set("rodape_usar_clinica", v)} />
                  </div>
                  {!form.rodape_usar_clinica && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Telefone</Label>
                        <Input value={form.rodape_telefone ?? ""} onChange={(e) => set("rodape_telefone", e.target.value || null)} />
                      </div>
                      <div>
                        <Label className="text-xs">Endereço</Label>
                        <Input value={form.rodape_endereco ?? ""} onChange={(e) => set("rodape_endereco", e.target.value || null)} />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs">Instagram (opcional)</Label>
                    <Input value={form.rodape_instagram ?? ""} onChange={(e) => set("rodape_instagram", e.target.value || null)} placeholder="@sua_clinica" />
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
          <div className="min-w-0">
            <div className="sticky top-4 space-y-2">
              <div className="text-xs text-gray-500">Prévia (A4)</div>
              <PagePreview cfg={form} clinica={clinica} logoSrc={logoSrc} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HeaderMiniPreview({
  estilo, cor, cor2, texto,
}: { estilo: HeaderEstilo; cor: string; cor2: string | null; texto: string }) {
  const bg = cor2 ? `linear-gradient(135deg, ${cor}, ${cor2})` : cor;
  const mini: Record<HeaderEstilo, React.CSSProperties> = {
    curva: {},
    barra: {},
    linha: {},
    timbrado: {},
    "faixa-lateral": {},
    canto: {},
    moldura: {},
    nenhum: {},
  };
  void mini;
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
      <div className="absolute right-1 top-1 text-[7px]" style={{ color: texto === "#FFFFFF" ? "#fff" : "#333", mixBlendMode: "difference" as any }}>
        {""}
      </div>
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

  // scale A4 (794x1123) to fit ~400px width
  const scale = 0.5;
  return (
    <div
      className="rounded border border-gray-300 shadow-sm bg-white"
      style={{
        width: PAGE_W * scale,
        height: PAGE_H * scale,
        overflow: "hidden",
      }}
    >
      <div
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
            top: metrics.top,
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
            documento é gerado. Ajuste o cabeçalho, cores e rodapé para ver como o PDF
            ficará antes de baixar.
          </p>
          <p style={{ marginBottom: 10, textAlign: "justify" }}>
            O layout do cabeçalho selecionado define automaticamente o espaço reservado
            para o conteúdo em todas as páginas, e o rodapé segue o mesmo padrão.
          </p>
          <div style={{ fontWeight: 700, margin: "14px 0 6px" }}>1. DAS PARTES</div>
          <p style={{ marginBottom: 10, textAlign: "justify" }}>
            Contratante e Contratada firmam o presente instrumento nos termos abaixo
            descritos, comprometendo-se a cumprir todas as cláusulas.
          </p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: footer }} />
      </div>
    </div>
  );
}