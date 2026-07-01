import { useEffect, useMemo, useState } from "react";
import { Plus, FileText, Eye, Pencil, Trash2, Paperclip, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchProfissionais,
  fetchServicos,
  formatBRL,
  type Profissional,
  type Servico,
} from "@/lib/configuracoes";
import {
  deleteContrato,
  FREQUENCIA_LABEL,
  listContratos,
  STATUS_LABEL,
  STATUS_STYLES,
  type ContratoComJoin,
  type ContratoStatus,
} from "@/lib/contratos";
import { ContratoFormDialog } from "./ContratoFormDialog";
import { ContratoView } from "./ContratoView";
import { DocumentoEstiloDialog } from "@/components/gestao/config/DocumentoEstiloDialog";

export function ContratosPage() {
  const [contratos, setContratos] = useState<ContratoComJoin[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ContratoStatus | "todos">("todos");
  const [profId, setProfId] = useState<string>("todos");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContratoComJoin | null>(null);
  const [viewing, setViewing] = useState<ContratoComJoin | null>(null);
  const [delTarget, setDelTarget] = useState<ContratoComJoin | null>(null);
  const [estiloOpen, setEstiloOpen] = useState(false);

  async function carregar() {
    setLoading(true);
    const r = await listContratos({ status, profissionalId: profId });
    setContratos(r);
    setLoading(false);
  }

  useEffect(() => {
    fetchProfissionais(false).then(setProfissionais);
    fetchServicos(false).then(setServicos);
  }, []);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, profId]);

  const filtered = useMemo(() => contratos, [contratos]);

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await deleteContrato(delTarget.id);
      toast.success("Contrato excluído");
      setDelTarget(null);
      carregar();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao excluir");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {(["rascunho", "ativo", "encerrado", "cancelado"] as ContratoStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={profId} onValueChange={setProfId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os profissionais</SelectItem>
              {profissionais.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setEstiloOpen(true)}
          className="border-amber-300 text-amber-800 hover:bg-amber-50"
        >
          <Palette className="mr-2 h-4 w-4" /> Estilo do PDF
        </Button>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-gradient-to-r from-[#D67F43] to-[#E89B6D] text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Contrato
        </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-amber-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 text-amber-900">
            <tr>
              <th className="px-4 py-3 text-left">Paciente</th>
              <th className="px-4 py-3 text-left">Serviço</th>
              <th className="px-4 py-3 text-left">Valor/sessão</th>
              <th className="px-4 py-3 text-left">Sessões</th>
              <th className="px-4 py-3 text-left">Frequência</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center" title="Contrato assinado anexado">
                <Paperclip className="inline h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  Carregando…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  Nenhum contrato encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-t border-amber-50 hover:bg-amber-50/40">
                  <td className="px-4 py-3 font-medium">{c.paciente?.nome ?? "—"}</td>
                  <td className="px-4 py-3">{c.servico?.nome ?? "—"}</td>
                  <td className="px-4 py-3">{formatBRL(c.valor_centavos)}</td>
                  <td className="px-4 py-3">{c.qtd_sessoes ?? "Indeterminado"}</td>
                  <td className="px-4 py-3">{FREQUENCIA_LABEL[c.frequencia]}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.arquivo_assinado_path ? (
                      <span
                        title={
                          c.arquivo_assinado_uploaded_at
                            ? `Anexado em ${new Date(c.arquivo_assinado_uploaded_at).toLocaleDateString("pt-BR")}`
                            : "Anexado"
                        }
                      >
                        <Paperclip className="inline h-4 w-4 text-amber-700" />
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setViewing(c)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(c);
                          setFormOpen(true);
                        }}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDelTarget(c)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ContratoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        profissionais={profissionais}
        servicos={servicos}
        contrato={editing ?? undefined}
        onSaved={() => carregar()}
      />

      <DocumentoEstiloDialog open={estiloOpen} onOpenChange={setEstiloOpen} />

      {viewing && (
        <ContratoView
          contrato={viewing}
          open={!!viewing}
          onOpenChange={(v) => !v && setViewing(null)}
          onChanged={() => carregar()}
        />
      )}

      <AlertDialog open={!!delTarget} onOpenChange={(v: boolean) => !v && setDelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}