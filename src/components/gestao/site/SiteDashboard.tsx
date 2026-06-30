import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Palette,
  FileText,
  Users,
  MessageSquareQuote,
  Sparkles,
  PanelTop,
  PanelBottom,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  ArrowRight,
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  fetchPaginas,
  fetchTema,
  fetchTeam,
  fetchTestimonials,
  fetchServicos,
  fetchSecoes,
  TEMA_DEFAULTS,
  type SitePagina,
  type SiteTema,
} from "@/lib/cms";
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";

type Counts = {
  secoesByPagina: Record<string, number>;
  team: number;
  depoimentos: number;
  servicos: number;
};

type StorageFile = {
  name: string;
  path: string;
  url: string | null;
  size: number | null;
  mime: string | null;
};

const PAGE_URL = (slug: string, isHome: boolean) => (isHome ? "/" : `/${slug}`);

export function SiteDashboard() {
  const [loading, setLoading] = useState(true);
  const [tema, setTema] = useState<SiteTema | null>(null);
  const [paginas, setPaginas] = useState<SitePagina[]>([]);
  const [counts, setCounts] = useState<Counts>({
    secoesByPagina: {},
    team: 0,
    depoimentos: 0,
    servicos: 0,
  });

  async function load() {
    setLoading(true);
    const [t, pgs, team, dep, svc] = await Promise.all([
      fetchTema(),
      fetchPaginas(true),
      fetchTeam(true),
      fetchTestimonials(true),
      fetchServicos(true),
    ]);
    setTema(t);
    setPaginas(pgs);
    const secCounts: Record<string, number> = {};
    await Promise.all(
      pgs.map(async (p) => {
        const s = await fetchSecoes(true, p.id);
        secCounts[p.id] = s.length;
      }),
    );
    setCounts({
      secoesByPagina: secCounts,
      team: team.length,
      depoimentos: dep.length,
      servicos: svc.length,
    });
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const themeEff = tema ?? ({ id: "singleton", ...TEMA_DEFAULTS } as SiteTema);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin do site</h1>
          <p className="text-sm text-muted-foreground">
            Visão 360° do conteúdo público: páginas, identidade visual e bibliotecas.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </button>
      </header>

      <IdentidadeCard tema={themeEff} hasRecord={!!tema} />

      <PaginasGrid paginas={paginas} secoesByPagina={counts.secoesByPagina} loading={loading} onReload={load} />

      <BibliotecaGrid counts={counts} />

      <ImagesPanel />
    </div>
  );
}

/* -------------------- Identidade -------------------- */

function IdentidadeCard({ tema, hasRecord }: { tema: SiteTema; hasRecord: boolean }) {
  const swatches: Array<{ label: string; color: string | null }> = [
    { label: "Primária", color: tema.cor_primaria },
    { label: "Hover", color: tema.cor_primaria_hover },
    { label: "Secundária", color: tema.cor_secundaria },
    { label: "Texto", color: tema.cor_texto },
    { label: "Fundo", color: tema.cor_fundo },
    { label: "Eyebrow", color: tema.cor_eyebrow },
  ];
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-foreground">Identidade</h2>
          {!hasRecord ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              usando padrão
            </span>
          ) : null}
        </div>
        <Link
          to="/gestao/site/layout/tema"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90"
        >
          Editar tema <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {swatches.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
            <div
              className="h-10 w-10 shrink-0 rounded-md border border-border"
              style={{ background: s.color ?? "transparent" }}
              title={s.color ?? "sem cor"}
            />
            <div className="min-w-0">
              <div className="truncate text-xs text-muted-foreground">{s.label}</div>
              <div className="truncate font-mono text-xs text-foreground">{s.color ?? "—"}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Meta label="Fonte de títulos" value={tema.fonte_titulos} />
        <Meta label="Fonte do corpo" value={tema.fonte_corpo} />
        <Meta label="Radius" value={`${tema.radius_px}px`} />
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

/* -------------------- Páginas -------------------- */

function PaginasGrid({
  paginas,
  secoesByPagina,
  loading,
  onReload,
}: {
  paginas: SitePagina[];
  secoesByPagina: Record<string, number>;
  loading: boolean;
  onReload: () => void | Promise<void>;
}) {
  async function toggleEnabled(p: SitePagina) {
    const { error } = await supabase
      .from("site_paginas")
      .update({ enabled: !p.enabled })
      .eq("id", p.id);
    if (error) {
      alert(error.message);
      return;
    }
    await onReload();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-foreground">Páginas</h2>
          <span className="text-xs text-muted-foreground">
            {paginas.length} {paginas.length === 1 ? "página" : "páginas"}
          </span>
        </div>
        <Link
          to="/gestao/site/paginas"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          Gerenciar <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading && paginas.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg border border-border bg-background" />
          ))}
        </div>
      ) : paginas.length === 0 ? (
        <EmptyHint
          text="Nenhuma página cadastrada ainda."
          ctaText="Criar primeira página"
          ctaTo="/gestao/site/paginas"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginas.map((p) => (
            <PaginaCard
              key={p.id}
              page={p}
              count={secoesByPagina[p.id] ?? 0}
              onToggle={() => toggleEnabled(p)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PaginaCard({
  page,
  count,
  onToggle,
}: {
  page: SitePagina;
  count: number;
  onToggle: () => void | Promise<void>;
}) {
  const url = PAGE_URL(page.slug, page.is_home);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div
        className="relative h-28 w-full bg-gradient-to-br from-muted to-accent"
        style={
          page.banner_imagem_url
            ? {
                backgroundImage: `url(${page.banner_imagem_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2 text-white">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold drop-shadow">{page.titulo}</div>
            <div className="truncate font-mono text-[11px] opacity-90">/{page.is_home ? "" : page.slug}</div>
          </div>
          {page.is_home ? (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand">
              HOME
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          {count} {count === 1 ? "seção" : "seções"}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
            page.enabled
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {page.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {page.enabled ? "Visível" : "Oculta"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1 border-t border-border px-2 py-1.5">
        <Link
          to="/gestao/site/paginas"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-foreground hover:bg-accent"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Link>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Ver
        </a>
        <button
          onClick={() => void onToggle()}
          disabled={page.is_home}
          title={page.is_home ? "A Home não pode ser ocultada" : page.enabled ? "Ocultar" : "Habilitar"}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {page.enabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {page.enabled ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}

/* -------------------- Biblioteca -------------------- */

function BibliotecaGrid({ counts }: { counts: Counts }) {
  const items = [
    { to: "/gestao/site/equipe", label: "Equipe", icon: Users, count: counts.team },
    { to: "/gestao/site/depoimentos", label: "Depoimentos", icon: MessageSquareQuote, count: counts.depoimentos },
    { to: "/gestao/site/servicos", label: "Serviços", icon: Sparkles, count: counts.servicos },
    { to: "/gestao/site/layout/header", label: "Cabeçalho", icon: PanelTop, count: null as number | null },
    { to: "/gestao/site/layout/rodape", label: "Rodapé", icon: PanelBottom, count: null as number | null },
  ] as const;
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-semibold text-foreground">Biblioteca</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="group rounded-lg border border-border bg-background p-4 transition hover:border-brand hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand" />
                {it.count != null ? (
                  <span className="text-2xl font-semibold text-foreground">{it.count}</span>
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">{it.label}</div>
              {it.count != null ? (
                <div className="text-xs text-muted-foreground">
                  {it.count} {it.count === 1 ? "item" : "itens"}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Configurar</div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------- Imagens -------------------- */

function ImagesPanel() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      setError(error.message);
      setFiles([]);
      setLoading(false);
      return;
    }
    const mapped: StorageFile[] = (data ?? [])
      .filter((o) => o.id) // skip folders
      .map((o: any) => ({
        name: o.name,
        path: o.name,
        url: publicImageUrl(o.name),
        size: o.metadata?.size ?? null,
        mime: o.metadata?.mimetype ?? null,
      }))
      .filter((f) => !f.mime || f.mime.startsWith("image/"));
    setFiles(mapped);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleUpload(filesList: FileList | null) {
    if (!filesList || filesList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(filesList)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from(SITE_IMAGES_BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
      }
      await load();
    } catch (e: any) {
      setError(e.message ?? "Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function copy(url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied((c) => (c === url ? null : c)), 1500);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-foreground">Imagens</h2>
          <span className="text-xs text-muted-foreground">
            {files.length} {files.length === 1 ? "arquivo" : "arquivos"} em <code>{SITE_IMAGES_BUCKET}</code>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Enviar
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {loading && files.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg border border-border bg-background" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <EmptyHint text="Nenhuma imagem enviada ainda. Use o botão Enviar para começar." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {files.map((f) => (
            <ImageTile key={f.path} file={f} copied={copied === f.url} onCopy={() => f.url && copy(f.url)} />
          ))}
        </div>
      )}
    </section>
  );
}

function ImageTile({
  file,
  copied,
  onCopy,
}: {
  file: StorageFile;
  copied: boolean;
  onCopy: () => void;
}) {
  const sizeKB = useMemo(() => (file.size ? Math.max(1, Math.round(file.size / 1024)) : null), [file.size]);
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-background">
      <div className="relative aspect-square w-full bg-muted">
        {file.url ? (
          <img src={file.url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
          <span className="truncate text-[10px] text-white/90">{file.name}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5 text-[11px] text-muted-foreground">
        <span className="truncate" title={file.name}>{file.name}</span>
        {sizeKB ? <span className="shrink-0">{sizeKB} KB</span> : null}
      </div>
      <button
        onClick={onCopy}
        disabled={!file.url}
        className="flex w-full items-center justify-center gap-1 border-t border-border px-2 py-1.5 text-[11px] text-foreground hover:bg-accent disabled:opacity-40"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar URL"}
      </button>
    </div>
  );
}

/* -------------------- Util -------------------- */

function EmptyHint({ text, ctaText, ctaTo }: { text: string; ctaText?: string; ctaTo?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background p-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      {ctaText && ctaTo ? (
        <Link
          to={ctaTo}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90"
        >
          {ctaText} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}