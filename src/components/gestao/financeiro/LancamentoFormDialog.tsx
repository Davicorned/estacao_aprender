import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
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
import { searchPacientesQuick } from "@/lib/agendamentos";
import { formatBRL, parseBRLToCents } from "@/lib/configuracoes";
import { createLancamento, type LancamentoTipo } from "@/lib/financeiro";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
  pacienteFixo?: { id: string; nome: string } | null;
};

type PacienteLite = { id: string; nome: string };

export function LancamentoFormDialog({ open, onOpenChange, onSaved, pacienteFixo }: Props) {
  const [tipo, setTipo] = useState<LancamentoTipo>("receita");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("R$ 0,00");
  const [venc, setVenc] = useState(new Date().toISOString().slice(0, 10));
  const [paciente, setPaciente] = useState<PacienteLite | null>(null);
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [pacienteResults, setPacienteResults] = useState<PacienteLite[]>([]);
  const [pacienteOpen, setPacienteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTipo("receita");
    setDescricao("");
    setValor("R$ 0,00");
    setVenc(new Date().toISOString().slice(0, 10));
    setPaciente(pacienteFixo ?? null);
    setPacienteSearch("");
    setPacienteResults([]);
    setPacienteOpen(false);
  }, [open, pacienteFixo]);

  useEffect(() => {
    if (!pacienteOpen) return;
    const t = setTimeout(async () => {
      if (pacienteSearch.trim().length < 2) return setPacienteResults([]);
      try {
        const r = await searchPacientesQuick(pacienteSearch);
        setPacienteResults(r as PacienteLite[]);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [pacienteSearch, pacienteOpen]);

  async function handleSubmit() {
    if (!descricao.trim()) return toast.error("Informe a descrição");
    const cents = parseBRLToCents(valor);
    if (cents <= 0) return toast.error("Informe o valor");
    setSaving(true);
    try {
      await createLancamento({
        paciente_id: paciente?.id ?? null,
        contrato_id: null,
        agendamento_id: null,
        tipo,
        descricao,
        valor_centavos: cents,
        data_vencimento: venc,
        data_pagamento: null,
        status: "pendente",
        forma_pagamento: null,
      });
      toast.success("Lançamento criado");
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as LancamentoTipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input value={valor} onChange={(e) => setValor(formatBRL(parseBRLToCents(e.target.value)))} />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>

          <div>
            <Label>Vencimento</Label>
            <Input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} />
          </div>

          <div>
            <Label>Paciente (opcional)</Label>
            {paciente ? (
              <div className="flex items-center justify-between rounded-md border bg-amber-50/50 px-3 py-2">
                <span>{paciente.nome}</span>
                {!pacienteFixo && (
                  <Button variant="ghost" size="sm" onClick={() => setPaciente(null)}>Trocar</Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar paciente..."
                    value={pacienteSearch}
                    onChange={(e) => setPacienteSearch(e.target.value)}
                    onFocus={() => setPacienteOpen(true)}
                  />
                </div>
                {pacienteOpen && pacienteResults.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
                    {pacienteResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="block w-full px-3 py-2 text-left hover:bg-amber-50"
                        onClick={() => {
                          setPaciente(p);
                          setPacienteOpen(false);
                          setPacienteSearch("");
                        }}
                      >
                        {p.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gradient-to-r from-[#D67F43] to-[#E89B6D] text-white"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}