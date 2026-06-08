import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMA_LABEL, registrarPagamento, type FormaPagamento } from "@/lib/financeiro";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ids: string[];
  onSaved?: () => void;
};

export function RegistrarPagamentoDialog({ open, onOpenChange, ids, onSaved }: Props) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [forma, setForma] = useState<FormaPagamento>("pix");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(new Date().toISOString().slice(0, 10));
      setForma("pix");
    }
  }, [open]);

  async function handle() {
    if (ids.length === 0) {
      toast.error("Nenhum lançamento selecionado");
      return;
    }
    setSaving(true);
    try {
      await registrarPagamento(ids, { data_pagamento: data, forma_pagamento: forma });
      toast.success(`${ids.length} pagamento(s) registrado(s)`);
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento ({ids.length})</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Data do pagamento</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label>Forma de pagamento</Label>
            <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(FORMA_LABEL) as FormaPagamento[]).map((f) => (
                  <SelectItem key={f} value={f}>{FORMA_LABEL[f]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handle} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}