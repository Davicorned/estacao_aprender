import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  DURACOES,
  fetchServicos,
  formatBRL,
  parseBRLToCents,
  type Servico,
} from "@/lib/configuracoes";

type Draft = {
  id?: string;
  nome: string;
  duracao_min: number;
  valor_centavos: number;
  ativo: boolean;
};

const empty: Draft = { nome: "", duracao_min: 50, valor_centavos: 18000, ativo: true };

export function ServicosSection() {
  const [items, setItems] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [valorInput, setValorInput] = useState("");

  async function load() {
    setLoading(true);
    setItems(await fetchServicos(true));
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, []);

  function startNew() {
    setEditing({ ...empty });
    setValorInput(formatBRL(empty.valor_centavos));
  }
  function startEdit(s: Servico) {
    setEditing({ ...s });
    setValorInput(formatBRL(s.valor_centavos));
  }
  function cancel() {
    setEditing(null);
    setValorInput("");
  }

  async function save() {
    if (!editing) return;
    const nome = editing.nome.trim();
    if (!nome) {
      toast.error("Nome obrigatório");
      return;
    }
    const payload = {
      nome,
      duracao_min: editing.duracao_min,
      valor_centavos: editing.valor_centavos,
      ativo: editing.ativo,
      updated_at: new Date().toISOString(),
    };
    const res = editing.id
      ? await supabase.from("servicos").update(payload).eq("id", editing.id)
      : await supabase.from("servicos").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvo");
    cancel();
    void load();
  }

  async function remove(s: Servico) {
    if (!confirm("Tem certeza? Agendamentos existentes não serão afetados.")) return;
    const { error } = await supabase.from("servicos").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    void load();
  }

  async function toggleAtivo(s: Servico) {
    const { error } = await supabase
      .from("servicos")
      .update({ ativo: !s.ativo })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    void load();
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Serviços / Procedimentos</h2>
          <p className="text-xs text-gray-500">
            Serviços desativados ficam ocultos em novos agendamentos.
          </p>
        </div>
        <Button
          onClick={startNew}
          disabled={!!editing}
          className="bg-[#D67F43] hover:bg-[#B85A24]"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar serviço
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-5 py-2 font-medium">Nome</th>
              <th className="px-5 py-2 font-medium">Duração</th>
              <th className="px-5 py-2 font-medium">Valor</th>
              <th className="px-5 py-2 font-medium">Ativo</th>
              <th className="px-5 py-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((s) => {
                const isEditing = editing?.id === s.id;
                return isEditing && editing ? (
                  <EditRow
                    key={s.id}
                    draft={editing}
                    setDraft={setEditing}
                    valorInput={valorInput}
                    setValorInput={setValorInput}
                    onSave={save}
                    onCancel={cancel}
                  />
                ) : (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.nome}</td>
                    <td className="px-5 py-3 text-gray-600">{s.duracao_min} min</td>
                    <td className="px-5 py-3 text-gray-600">{formatBRL(s.valor_centavos)}</td>
                    <td className="px-5 py-3">
                      <Switch
                        checked={s.ativo}
                        onCheckedChange={() => toggleAtivo(s)}
                        disabled={!!editing}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(s)}
                        disabled={!!editing}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(s)}
                        disabled={!!editing}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}

            {!loading && editing && !editing.id && (
              <EditRow
                draft={editing}
                setDraft={setEditing}
                valorInput={valorInput}
                setValorInput={setValorInput}
                onSave={save}
                onCancel={cancel}
              />
            )}

            {!loading && items.length === 0 && !editing && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Nenhum serviço cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EditRow({
  draft,
  setDraft,
  valorInput,
  setValorInput,
  onSave,
  onCancel,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  valorInput: string;
  setValorInput: (s: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="border-b border-gray-100 bg-[#FEF3E8]/40">
      <td className="px-5 py-3">
        <Input
          value={draft.nome}
          onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
          placeholder="Ex: Sessão de Psicopedagogia"
          maxLength={100}
          autoFocus
        />
      </td>
      <td className="px-5 py-3">
        <Select
          value={String(draft.duracao_min)}
          onValueChange={(v) => setDraft({ ...draft, duracao_min: parseInt(v, 10) })}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURACOES.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d} min
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-5 py-3">
        <Input
          value={valorInput}
          onChange={(e) => {
            const cents = parseBRLToCents(e.target.value);
            setDraft({ ...draft, valor_centavos: cents });
            setValorInput(formatBRL(cents));
          }}
          className="w-32"
        />
      </td>
      <td className="px-5 py-3">
        <Switch
          checked={draft.ativo}
          onCheckedChange={(v) => setDraft({ ...draft, ativo: v })}
        />
      </td>
      <td className="px-5 py-3 text-right">
        <Button
          size="icon"
          variant="ghost"
          onClick={onSave}
          className="text-green-600 hover:text-green-700"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}