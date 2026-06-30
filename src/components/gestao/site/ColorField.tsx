import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normHex(v: string | null | undefined): string {
  if (!v) return "#ffffff";
  if (HEX_RE.test(v)) {
    // expandir #abc -> #aabbcc para o <input type=color>
    if (v.length === 4) return "#" + [v[1], v[1], v[2], v[2], v[3], v[3]].join("");
    return v.toLowerCase();
  }
  return "#ffffff";
}

/** Util compartilhado: monta um valor CSS `background` a partir de 1 ou 2 cores. */
export function buildBackground(cor1: string | null | undefined, cor2?: string | null | undefined): string | undefined {
  if (!cor1) return undefined;
  if (cor2) return `linear-gradient(135deg, ${cor1}, ${cor2})`;
  return cor1;
}

type Props = {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  presets?: string[];
  allowGradient?: boolean;
  value2?: string | null;
  onChange2?: (v: string | null) => void;
  helperText?: string;
};

function Swatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={color}
      className={`h-7 w-7 rounded-md border transition ${selected ? "ring-2 ring-offset-2 ring-[#D67F43] border-transparent" : "border-border hover:scale-110"}`}
      style={{ background: color }}
    />
  );
}

function HexPicker({ value, onChange, label }: { value: string | null; onChange: (v: string | null) => void; label?: string }) {
  const [text, setText] = useState<string>(value ?? "");
  useEffect(() => { setText(value ?? ""); }, [value]);
  return (
    <div className="flex items-center gap-2">
      {label && <span className="w-14 text-xs text-muted-foreground">{label}</span>}
      <input
        type="color"
        value={normHex(value)}
        onChange={(e) => { setText(e.target.value); onChange(e.target.value); }}
        className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
      />
      <Input
        value={text}
        placeholder="#FFFFFF"
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          if (!v.trim()) { onChange(null); return; }
          if (HEX_RE.test(v)) onChange(v);
        }}
        className="h-9 max-w-[120px] font-mono text-sm"
      />
    </div>
  );
}

export function ColorField({
  label, value, onChange, presets = [], allowGradient = false, value2 = null, onChange2, helperText,
}: Props) {
  const gradientOn = !!value2;
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm">{label}</Label>
        {value && (
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { onChange(null); onChange2?.(null); }}>
            <X className="mr-1 h-3 w-3" /> Usar padrão
          </Button>
        )}
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <Swatch key={p} color={p} selected={value === p && !value2} onClick={() => { onChange(p); onChange2?.(null); }} />
          ))}
        </div>
      )}

      <HexPicker value={value} onChange={onChange} label={allowGradient ? "Cor 1" : undefined} />

      {allowGradient && onChange2 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Usar gradiente (2 cores)</span>
            <Switch
              checked={gradientOn}
              onCheckedChange={(on) => {
                if (on) onChange2(value ?? "#ffffff");
                else onChange2(null);
              }}
            />
          </div>
          {gradientOn && <HexPicker value={value2} onChange={onChange2} label="Cor 2" />}
        </>
      )}

      {helperText && <p className="text-[11px] text-muted-foreground">{helperText}</p>}

      {/* Prévia da cor aplicada */}
      <div
        className="h-8 w-full rounded border border-border"
        style={{ background: buildBackground(value, value2) ?? "repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 12px 12px" }}
      />
    </div>
  );
}