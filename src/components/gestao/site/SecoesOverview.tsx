import { useEffect, useState } from "react";
import { Plus, Pencil, FileText, Home, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  fetchPaginas, fetchSecoes, invalidateCmsCache,
  type SitePagina, type SiteSecao,
} from "@/lib/cms";
import { SECTION_TEMPLATES_BY_TIPO } from "@/lib/site-templates";
import { PaginaBuilder } from "./PaginasManager";
import { pageCanonicalUrl } from "@/lib/site-page-routes";

type PaginaComSecoes = SitePagina & { secoes: SiteSecao[] };

export function SecoesOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginaComSecoes[]>([]);
  const [editing, setEditing] = useState<{ pagina: SitePagina; openSecaoId?: string } | null>(null);

  // Diálogo "Nova seção" — pede página de destino primeiro
  const [pickPaginaOpen, setPickPaginaOpen] = useState(false);
  const [pickPaginaId, setPickPaginaId] = useState<string>("");

  async function load() {
    setLoading(true);
    invalidateCmsCache("paginas");
    invalidateCmsCache("secoes");
    const pgs = await fetchPaginas(true);
    const results = await Promise.all(
      pgs.map(async (p) => ({ ...p, secoes: await fetchSecoes(true, p.id) })),
    );
    setData(results);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  if (editing) {
    return (
      <PaginaBuilder
        pagina={editing.pagina}
        openSecaoId={editing.openSecaoId}
        onBack={() => { setEditing(null); void load(); }}
      />
    );
  }

  const tipoLabel = (t: string) =>
    (SECTION_TEMPLATES_BY_TIPO as any)[t]?.label ?? t;

  function startNova() {
    if (data.length === 0) {
      toast.error("Crie uma página antes de adicionar seções.");
      return;
    }
    setPickPaginaId(data[0].id);
    setPickPaginaOpen(true);
  }
  function confirmNova() {
    const p = data.find((x) => x.id === pickPaginaId);
    if (!p) return;
    setPickPaginaOpen(false);
    setEditing({ pagina: p });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Seções agrupadas por página. Toda seção pertence a uma página.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Para construir o conteúdo de uma página, abra <strong>Páginas</strong> ou clique em <strong>Editar</strong> ao lado da seção.
          </p>
        </div>
        <Button onClick={startNova} className="bg-[#D67F43] hover:bg-[#B85A24]">
          <Plus className="mr-2 h-4 w-4" /> Nova seção
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="space-y-6">
          {data.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {p.is_home ? <Home className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{p.titulo}</p>
                      <span className="rounded bg-[#FEF3E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B85A24] dark:bg-brand/15 dark:text-brand">
                        {p.is_home ? "Home" : p.slug}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      <code>{pageCanonicalUrl(p.slug, p.is_home)}</code> · {p.secoes.length} seção{p.secoes.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing({ pagina: p })}>
                  Construir <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {p.secoes.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Nenhuma seção nesta página ainda.{" "}
                  <button
                    className="font-medium text-[#B85A24] hover:underline dark:text-amber-300"
                    onClick={() => setEditing({ pagina: p })}
                  >
                    Adicionar agora ›
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {p.secoes.map((s, idx) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{s.titulo || s.eyebrow || "(sem título)"}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {tipoLabel(s.tipo)} · {s.itens.length} item{s.itens.length !== 1 ? "s" : ""}
                          {!s.enabled ? " · oculta" : ""}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing({ pagina: p, openSecaoId: s.id })}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nova seção: escolher página de destino primeiro */}
      <Dialog open={pickPaginaOpen} onOpenChange={setPickPaginaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova seção — escolher página</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground inline-flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#D67F43]" />
              Toda seção precisa pertencer a uma página. Escolha onde a nova seção vai renderizar.
            </p>
            <div>
              <Label className="text-xs">Página de destino</Label>
              <Select value={pickPaginaId} onValueChange={setPickPaginaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {data.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.titulo}{p.is_home ? " (Home)" : ""} — /{p.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPickPaginaOpen(false)}>Cancelar</Button>
            <Button onClick={confirmNova} className="bg-[#D67F43] hover:bg-[#B85A24]">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}