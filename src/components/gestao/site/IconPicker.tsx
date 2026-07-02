import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ICONES_SUGERIDOS } from "@/lib/site-templates";

/** Resolve um nome lucide para o componente; cai em Sparkles se não existir. */
export function getLucideIcon(name?: string | null): any {
  if (!name) return Sparkles;
  const I = (LucideIcons as unknown as Record<string, any>)[name];
  return I ?? Sparkles;
}

/** Todos os nomes de ícones do lucide-react (PascalCase, sem aliases "*Icon" duplicados). */
export const ALL_LUCIDE_ICON_NAMES: string[] = (() => {
  const all = Object.keys(LucideIcons as Record<string, unknown>).filter((k) => {
    if (!/^[A-Z][A-Za-z0-9]+$/.test(k)) return false;
    if (k === "Icon" || k === "LucideIcon" || k === "createLucideIcon") return false;
    const v = (LucideIcons as any)[k];
    return typeof v === "object" || typeof v === "function";
  });
  const set = new Set(all);
  return all.filter((k) => !(k.endsWith("Icon") && set.has(k.slice(0, -4)))).sort();
})();

type Props = {
  value: string | null | undefined;
  onChange: (name: string) => void;
  suggestions?: readonly string[];
  placeholder?: string;
};

/** Seletor de ícone reutilizável e pesquisável. */
export function IconPicker({
  value,
  onChange,
  suggestions = ICONES_SUGERIDOS,
  placeholder = "Escolher ícone",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const Current = getLucideIcon(value ?? "");
  const list = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 60);
    return ALL_LUCIDE_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(0, 60);
  })();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 font-normal">
          <Current className="h-4 w-4 shrink-0" />
          <span className="truncate">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2" align="start">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ícone (ex.: Stethoscope, Baby…)"
          className="mb-2 h-8"
        />
        <div className="max-h-64 overflow-y-auto">
          {!query && (
            <div className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted-foreground">Sugestões</div>
          )}
          <div className="grid grid-cols-6 gap-1">
            {list.map((name) => {
              const I = getLucideIcon(name);
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-center rounded-md border transition ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <I className="h-4 w-4" />
                </button>
              );
            })}
            {list.length === 0 && (
              <div className="col-span-6 py-4 text-center text-xs text-muted-foreground">
                Nenhum ícone encontrado.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}