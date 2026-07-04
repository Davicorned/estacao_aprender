import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfissionais, fetchServicos, type Profissional } from "@/lib/configuracoes";

type Draft = {
  id?: string;
  nome: string;
  titulo: string;
  especialidades: string[];
  cor_agenda: string;
  ativo: boolean;
};

const empty: Draft = {
  nome: "",
  titulo: "",
  especialidades: [],
  cor_agenda: "#D67F43",
  ativo: true,
};

export function ProfissionaisSection() {
  const [items, setItems] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [servicoNomes, setServicoNomes] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const [profs, servs] = await Promise.all([
      fetchProfissionais(true),
      fetchServicos(true),
    ]);
    setItems(profs);
    setServicoNomes(servs.map((s) => s.nome));
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, []);

  function startNew() {
    setEditing({ ...empty });
  }
  function startEdit(p: Profissional) {
    setEditing({
      id: p.id,
      nome: p.nome,
      titulo: p.titulo ?? "",
      especialidades: [...p.especialidades],
      cor_agenda: p.cor_agenda,
      ativo: p.ativo,
    });
  }
  function cancel() {
    setEditing(null);
  }

  async function save() {
    if (!editing) return;
    const nome = editing.nome.trim();
    if (!nome) return toast.error("Nome obrigatório");
    const especialidades = Array.from(
      new Set(editing.especialidades.map((s) => s.trim()).filter(Boolean)),
    );
    const payload = {
      nome,
      titulo: editing.titulo.trim() || null,
      especialidades,
      cor_agenda: editing.cor_agenda,
      ativo: editing.ativo,
    };
    const res = editing.id
      ? await supabase.from("profissionais").update(payload).eq("id", editing.id)
      : await supabase.from("profissionais").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvo");
    cancel();
    void load();
  }

  async function remove(p: Profissional) {
    if (!confirm("Tem certeza? Agendamentos existentes não serão afetados.")) return;
    const { error } = await supabase.from("profissionais").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    void load();
  }

  async function toggleAtivo(p: Profissional) {
    const { error } = await supabase
      .from("profissionais")
      .update({ ativo: !p.ativo })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    void load();
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Profissionais</h2>
          <p className="text-xs text-gray-500">
            Cor da agenda identifica visualmente os agendamentos.
          </p>
        </div>
        <Button
          onClick={startNew}
          disabled={!!editing}
          className="bg-[#D67F43] hover:bg-[#B85A24]"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar profissional
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-5 py-2 font-medium">Nome</th>
              <th className="px-5 py-2 font-medium">Título</th>
              <th className="px-5 py-2 font-medium">Especialidades</th>
              <th className="px-5 py-2 font-medium">Cor</th>
              <th className="px-5 py-2 font-medium">Ativo</th>
              <th className="px-5 py-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-gray-400">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((p) => {
                const isEditing = editing?.id === p.id;
                return isEditing && editing ? (
                  <EditRow
                    key={p.id}
                    draft={editing}
                    setDraft={setEditing}
                    servicoNomes={servicoNomes}
                    onSave={save}
                    onCancel={cancel}
                  />
                ) : (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.nome}</td>
                    <td className="px-5 py-3 text-gray-600">{p.titulo ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.especialidades.map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-[#FEF3E8] px-2 py-0.5 text-xs text-[#B85A24]"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div
                        className="h-6 w-6 rounded-full border border-gray-200"
                        style={{ background: p.cor_agenda }}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Switch
                        checked={p.ativo}
                        onCheckedChange={() => toggleAtivo(p)}
                        disabled={!!editing}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(p)}
                        disabled={!!editing}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(p)}
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
                servicoNomes={servicoNomes}
                onSave={save}
                onCancel={cancel}
              />
            )}

            {!loading && items.length === 0 && !editing && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-gray-400">
                  Nenhum profissional cadastrado.
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
  servicoNomes,
  onSave,
  onCancel,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  servicoNomes: string[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const selected = draft.especialidades;
  const norm = (s: string) => s.trim().toLowerCase();
  const isSelected = (nome: string) => selected.some((s) => norm(s) === norm(nome));
  const toggle = (nome: string) => {
    if (isSelected(nome)) {
      setDraft({
        ...draft,
        especialidades: selected.filter((s) => norm(s) !== norm(nome)),
      });
    } else {
      setDraft({ ...draft, especialidades: [...selected, nome] });
    }
  };
  const removeOne = (nome: string) =>
    setDraft({ ...draft, especialidades: selected.filter((s) => s !== nome) });

  return (
    <tr className="border-b border-gray-100 bg-[#FEF3E8]/40">
      <td className="px-5 py-3">
        <Input
          value={draft.nome}
          onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
          placeholder="Nome"
          maxLength={100}
          autoFocus
        />
      </td>
      <td className="px-5 py-3">
        <Input
          value={draft.titulo}
          onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
          placeholder="Ex: Psicóloga"
          maxLength={80}
        />
      </td>
      <td className="px-5 py-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm hover:bg-accent/50"
            >
              <div className="flex flex-wrap gap-1">
                {selected.length === 0 && (
                  <span className="text-muted-foreground">Selecionar especialidades…</span>
                )}
                {selected.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-[#FEF3E8] px-2 py-0.5 text-xs text-[#B85A24]"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOne(s);
                      }}
                      className="hover:text-red-600"
                      aria-label={`Remover ${s}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar serviço…" />
              <CommandList>
                <CommandEmpty>
                  {servicoNomes.length === 0
                    ? "Nenhum serviço cadastrado."
                    : "Nenhum resultado."}
                </CommandEmpty>
                <CommandGroup heading="Serviços">
                  {servicoNomes.map((nome) => {
                    const checked = isSelected(nome);
                    return (
                      <CommandItem
                        key={nome}
                        value={nome}
                        onSelect={() => toggle(nome)}
                      >
                        <div
                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                            checked
                              ? "border-[#D67F43] bg-[#D67F43] text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </div>
                        {nome}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </td>
      <td className="px-5 py-3">
        <input
          type="color"
          value={draft.cor_agenda}
          onChange={(e) => setDraft({ ...draft, cor_agenda: e.target.value })}
          className="h-8 w-12 cursor-pointer rounded border border-gray-200 bg-white p-0"
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