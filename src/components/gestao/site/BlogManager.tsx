import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload,
  X,
  Loader2,
} from "lucide-react";
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
import { supabase, SITE_IMAGES_BUCKET, publicImageUrl } from "@/integrations/supabase/client";
import {
  type BlogPost,
  type BlogStatus,
  deletePost,
  despublicarPost,
  fetchTodosPosts,
  publicarPost,
  savePost,
  slugify,
} from "@/lib/blog";
import { EditorLayout } from "./EditorLayout";
const RichTextEditor = lazy(() =>
  import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
);

type EditingState =
  | { mode: "list" }
  | { mode: "edit"; post: FormState };

type FormState = {
  id?: string;
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  capa_url: string | null; // path do storage OU URL absoluta
  autor: string;
  categoria: string;
  tagsText: string;
  status: BlogStatus;
  publicado_em: string; // yyyy-mm-ddThh:mm ou ""
  meta_title: string;
  meta_description: string;
  og_image: string | null;
};

function emptyForm(): FormState {
  return {
    slug: "",
    titulo: "",
    resumo: "",
    conteudo: "",
    capa_url: null,
    autor: "",
    categoria: "",
    tagsText: "",
    status: "rascunho",
    publicado_em: "",
    meta_title: "",
    meta_description: "",
    og_image: null,
  };
}

function postToForm(p: BlogPost): FormState {
  return {
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    resumo: p.resumo ?? "",
    conteudo: p.conteudo ?? "",
    capa_url: p.capa_url,
    autor: p.autor ?? "",
    categoria: p.categoria ?? "",
    tagsText: (p.tags ?? []).join(", "),
    status: p.status,
    publicado_em: p.publicado_em ? p.publicado_em.slice(0, 16) : "",
    meta_title: p.meta_title ?? "",
    meta_description: p.meta_description ?? "",
    og_image: p.og_image,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<EditingState>({ mode: "list" });

  async function reload() {
    setLoading(true);
    try {
      setPosts(await fetchTodosPosts());
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar artigos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleTogglePublish(p: BlogPost) {
    try {
      if (p.status === "publicado") await despublicarPost(p.id);
      else await publicarPost(p.id);
      toast.success(p.status === "publicado" ? "Artigo oculto" : "Artigo publicado");
      await reload();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    }
  }

  async function handleDelete(p: BlogPost) {
    if (!window.confirm(`Excluir o artigo "${p.titulo}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await deletePost(p.id);
      toast.success("Artigo excluído");
      await reload();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    }
  }

  if (state.mode === "edit") {
    return (
      <BlogEditor
        initial={state.post}
        onCancel={() => setState({ mode: "list" })}
        onSaved={async () => {
          await reload();
          setState({ mode: "list" });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Crie e publique artigos. Os posts publicados aparecerão no site.
          </p>
        </div>
        <Button
          onClick={() => setState({ mode: "edit", post: emptyForm() })}
          className="bg-[#D67F43] hover:bg-[#B85A24]"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo artigo
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum artigo ainda. Clique em <b>Novo artigo</b> para começar.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{p.titulo || "(sem título)"}</p>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                        (p.status === "publicado"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300")
                      }
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    /{p.slug} · {p.status === "publicado" ? "publicado em " + formatDate(p.publicado_em) : "atualizado em " + formatDate(p.updated_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setState({ mode: "edit", post: postToForm(p) })}
                    title="Editar"
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleTogglePublish(p)}
                    title={p.status === "publicado" ? "Ocultar" : "Publicar"}
                  >
                    {p.status === "publicado" ? (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-4 w-4" /> Publicar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => void handleDelete(p)}
                    title="Excluir"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ============= Editor =============

function useImageUpload(prefix: string) {
  const [uploading, setUploading] = useState(false);
  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    setUploading(false);
    if (error) {
      toast.error("Falha no upload: " + error.message);
      return null;
    }
    return path;
  }
  return { uploading, upload };
}

function BlogEditor({
  initial,
  onCancel,
  onSaved,
}: {
  initial: FormState;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const slugEdited = useRef(!!initial.id); // slug manual quando editando existente
  const capaFileRef = useRef<HTMLInputElement | null>(null);
  const ogFileRef = useRef<HTMLInputElement | null>(null);
  const capaUpload = useImageUpload("blog/capa");
  const ogUpload = useImageUpload("blog/og");

  const capaSrc = useMemo(
    () => (form.capa_url ? (form.capa_url.startsWith("http") ? form.capa_url : publicImageUrl(form.capa_url)) : null),
    [form.capa_url],
  );
  const ogSrc = useMemo(
    () => (form.og_image ? (form.og_image.startsWith("http") ? form.og_image : publicImageUrl(form.og_image)) : null),
    [form.og_image],
  );

  function updateTitulo(v: string) {
    setForm((f) => {
      const next: FormState = { ...f, titulo: v };
      if (!slugEdited.current) next.slug = slugify(v);
      return next;
    });
  }

  async function handleSave() {
    if (!form.titulo.trim()) return toast.error("Informe um título.");
    const slug = (form.slug || slugify(form.titulo)).trim();
    if (!slug) return toast.error("Informe um slug válido.");
    setSaving(true);
    try {
      const tags = form.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const publicado_em =
        form.status === "publicado"
          ? form.publicado_em
            ? new Date(form.publicado_em).toISOString()
            : new Date().toISOString()
          : form.publicado_em
            ? new Date(form.publicado_em).toISOString()
            : null;
      const conteudoSanitizado = form.conteudo
        ? DOMPurify.sanitize(form.conteudo, { USE_PROFILES: { html: true } })
        : "";
      const patch = {
        ...(form.id ? { id: form.id } : {}),
        slug,
        titulo: form.titulo,
        resumo: form.resumo || null,
        conteudo: conteudoSanitizado,
        capa_url: form.capa_url,
        autor: form.autor || null,
        categoria: form.categoria || null,
        tags,
        status: form.status,
        publicado_em,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        og_image: form.og_image,
      };
      await savePost(patch);
      toast.success("Artigo salvo");
      await onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    {
      value: "conteudo",
      label: "Conteúdo",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={form.titulo} onChange={(e) => updateTitulo(e.target.value)} placeholder="Ex.: Como preparar seu filho para a terapia" />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                slugEdited.current = true;
                setForm({ ...form, slug: slugify(e.target.value) });
              }}
              placeholder="como-preparar-seu-filho"
            />
            <p className="text-xs text-muted-foreground">Gerado automaticamente do título; edite se quiser.</p>
          </div>
          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea
              rows={3}
              value={form.resumo}
              onChange={(e) => setForm({ ...form, resumo: e.target.value })}
              placeholder="Um parágrafo curto que aparece na lista de artigos e nas prévias."
            />
          </div>
          <div className="space-y-2">
            <Label>Corpo do artigo</Label>
            <RichTextEditor value={form.conteudo} onChange={(html) => setForm((f) => ({ ...f, conteudo: html }))} />
          </div>
        </div>
      ),
    },
    {
      value: "capa",
      label: "Capa",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-40 w-64 overflow-hidden rounded-lg bg-[#FEF3E8]">
              {capaSrc ? (
                <img src={capaSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">sem capa</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={capaFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  const path = await capaUpload.upload(f);
                  if (path) setForm((prev) => ({ ...prev, capa_url: path }));
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => capaFileRef.current?.click()}
                disabled={capaUpload.uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {capaUpload.uploading ? "Enviando…" : "Trocar capa"}
              </Button>
              {form.capa_url && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setForm((f) => ({ ...f, capa_url: null }))}
                >
                  <X className="mr-2 h-4 w-4" /> Remover
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Recomendado: imagem horizontal (1600×900). Aparece no topo do artigo e na lista.
          </p>
        </div>
      ),
    },
    {
      value: "publicacao",
      label: "Publicação",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: BlogStatus) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de publicação</Label>
              <Input
                type="datetime-local"
                value={form.publicado_em}
                onChange={(e) => setForm({ ...form, publicado_em: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Se vazio ao publicar, usa a data atual.</p>
            </div>
            <div className="space-y-2">
              <Label>Autor</Label>
              <Input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} placeholder="Nome do autor" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex.: Dicas para pais" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="separadas, por, vírgula"
            />
          </div>
        </div>
      ),
    },
    {
      value: "seo",
      label: "SEO",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Meta title</Label>
            <Input
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              placeholder="(opcional) usa o título se vazio"
            />
          </div>
          <div className="space-y-2">
            <Label>Meta description</Label>
            <Textarea
              rows={3}
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              placeholder="(opcional) resumo curto para busca — até ~160 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label>Imagem de compartilhamento (og:image)</Label>
            <div className="flex items-start gap-4">
              <div className="h-28 w-48 overflow-hidden rounded-lg bg-[#FEF3E8]">
                {ogSrc ? (
                  <img src={ogSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">usa a capa</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={ogFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    const path = await ogUpload.upload(f);
                    if (path) setForm((prev) => ({ ...prev, og_image: path }));
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => ogFileRef.current?.click()}
                  disabled={ogUpload.uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {ogUpload.uploading ? "Enviando…" : "Escolher imagem"}
                </Button>
                {form.og_image && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setForm((f) => ({ ...f, og_image: null }))}
                  >
                    <X className="mr-2 h-4 w-4" /> Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const preview = (
    <div className="overflow-hidden rounded-xl border border-border bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      {capaSrc ? (
        <img src={capaSrc} alt="" className="h-52 w-full object-cover" />
      ) : (
        <div className="flex h-52 w-full items-center justify-center bg-[#FEF3E8] text-xs text-muted-foreground">
          Prévia da capa
        </div>
      )}
      <div className="space-y-3 p-6">
        {form.categoria && (
          <span className="inline-block rounded-full bg-[#FEF3E8] px-2 py-0.5 text-xs font-medium text-[#B85A24]">
            {form.categoria}
          </span>
        )}
        <h2 className="text-2xl font-semibold leading-tight">{form.titulo || "Título do artigo"}</h2>
        {form.resumo && <p className="text-sm text-muted-foreground">{form.resumo}</p>}
        {(form.autor || form.publicado_em) && (
          <p className="text-xs text-muted-foreground">
            {form.autor && <>por {form.autor}</>}
            {form.autor && form.publicado_em && " · "}
            {form.publicado_em && new Date(form.publicado_em).toLocaleDateString("pt-BR")}
          </p>
        )}
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: form.conteudo || "<p class='text-muted-foreground'>O conteúdo do artigo aparece aqui.</p>" }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
      <EditorLayout
        title={form.id ? "Editar artigo" : "Novo artigo"}
        tabs={tabs}
        preview={preview}
      />
    </div>
  );
}