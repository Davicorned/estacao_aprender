import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fetchPaginas, type SitePagina } from "@/lib/cms";

/**
 * Telefone padrão usado para montar links wa.me quando o usuário escolhe
 * o modo "WhatsApp". Mesmo número usado no rodapé e CTAs do site.
 */
const WHATSAPP_PHONE = "5511932139815";

type Mode = "pagina" | "whatsapp" | "externo" | "ancora";

type PageOption = { titulo: string; path: string };

const BUILTIN: PageOption[] = [
  { titulo: "Home", path: "/" },
  { titulo: "Quem Somos", path: "/QuemSomos" },
  { titulo: "Serviços", path: "/Servicos" },
  { titulo: "Atendimento", path: "/Atendimento" },
  { titulo: "Contato", path: "/Contato" },
];

function pageFromCms(p: SitePagina): PageOption {
  return { titulo: p.titulo, path: p.is_home ? "/" : `/${p.slug}` };
}

function extractWaMessage(value: string): string {
  try {
    const u = new URL(value);
    const t = u.searchParams.get("text") ?? "";
    return t;
  } catch {
    return "";
  }
}

function buildWaLink(message: string): string {
  const base = `https://wa.me/${WHATSAPP_PHONE}`;
  const m = message.trim();
  return m ? `${base}?text=${encodeURIComponent(m)}` : base;
}

function detectMode(value: string, pages: PageOption[], allowAnchor: boolean): Mode {
  if (!value) return "pagina";
  if (value.includes("wa.me")) return "whatsapp";
  if (allowAnchor && value.startsWith("#")) return "ancora";
  if (value.startsWith("/")) {
    const hit = pages.find((p) => p.path.toLowerCase() === value.toLowerCase());
    return hit ? "pagina" : "externo";
  }
  if (value.startsWith("http")) return "externo";
  return "externo";
}

export function LinkField({
  label,
  value,
  onChange,
  allowWhatsApp = true,
  allowAnchor = false,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  allowWhatsApp?: boolean;
  allowAnchor?: boolean;
  placeholder?: string;
}) {
  const [cmsPages, setCmsPages] = useState<PageOption[]>([]);

  useEffect(() => {
    let alive = true;
    fetchPaginas(false)
      .then((rows) => { if (alive) setCmsPages(rows.map(pageFromCms)); })
      .catch(() => { /* silencioso — usa builtins */ });
    return () => { alive = false; };
  }, []);

  const pages = useMemo<PageOption[]>(() => {
    const seen = new Set<string>();
    const all = [...BUILTIN, ...cmsPages];
    const out: PageOption[] = [];
    for (const p of all) {
      const key = p.path.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
    return out;
  }, [cmsPages]);

  const [mode, setMode] = useState<Mode>(() => detectMode(value ?? "", pages, allowAnchor));

  // Reavalia o modo quando a lista de páginas chega do CMS (um valor que parecia
  // "externo" pode na verdade casar com uma página recém-criada).
  useEffect(() => {
    setMode(detectMode(value ?? "", pages, allowAnchor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  function handleModeChange(next: Mode) {
    setMode(next);
    if (next === "whatsapp") {
      if (!value || !value.includes("wa.me")) onChange(buildWaLink(""));
    } else if (next === "ancora") {
      if (!value?.startsWith("#")) onChange("");
    } else if (next === "externo") {
      if (value && (value.startsWith("/") || value.includes("wa.me"))) onChange("");
    } else if (next === "pagina") {
      // mantém o valor; o Select tratará via value/onValueChange
    }
  }

  const matchedPagePath =
    mode === "pagina"
      ? pages.find((p) => p.path.toLowerCase() === (value ?? "").toLowerCase())?.path ?? ""
      : "";

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr]">
        <Select value={mode} onValueChange={(v) => handleModeChange(v as Mode)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pagina">Página do site</SelectItem>
            {allowWhatsApp && <SelectItem value="whatsapp">WhatsApp</SelectItem>}
            <SelectItem value="externo">Link externo</SelectItem>
            {allowAnchor && <SelectItem value="ancora">Âncora na página</SelectItem>}
          </SelectContent>
        </Select>

        {mode === "pagina" && (
          <Select value={matchedPagePath} onValueChange={(v) => onChange(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma página…" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((p) => (
                <SelectItem key={p.path} value={p.path}>
                  {p.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {mode === "whatsapp" && (
          <Input
            value={extractWaMessage(value ?? "")}
            onChange={(e) => onChange(buildWaLink(e.target.value))}
            placeholder="Mensagem (opcional). Ex: Olá! Quero agendar."
          />
        )}

        {mode === "externo" && (
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "https://…"}
          />
        )}

        {mode === "ancora" && (
          <Input
            value={value ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(raw.startsWith("#") || raw === "" ? raw : `#${raw}`);
            }}
            placeholder="#secao"
          />
        )}
      </div>
      {value && (
        <p className="text-[11px] text-muted-foreground">
          → <code className="break-all">{value}</code>
        </p>
      )}
    </div>
  );
}