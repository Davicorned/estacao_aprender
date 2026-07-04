import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  buildWhatsappLink,
  fetchSiteContatos,
  invalidateCmsCache,
  formatBrazilPhoneDisplay,
  isValidBrazilPhone,
  type ContatoTelefone,
  type ContatoEmail,
  type ContatoEndereco,
} from "@/lib/cms";

type Telefone = Omit<ContatoTelefone, "id"> & { id?: string; _new?: boolean };
type Email = Omit<ContatoEmail, "id"> & { id?: string; _new?: boolean };
type Endereco = Omit<ContatoEndereco, "id"> & { id?: string; _new?: boolean };

function newTelefone(ordem: number): Telefone {
  return {
    rotulo: "",
    telefone_exibido: "",
    whatsapp_enabled: true,
    whatsapp_mensagem: "Olá! Vim pelo site e gostaria de mais informações.",
    usar_no_botao_flutuante: false,
    mostrar_no_header: false,
    ordem,
    enabled: true,
    _new: true,
  };
}
function newEmail(ordem: number): Email {
  return { rotulo: "", email: "", ordem, enabled: true, _new: true };
}
function newEndereco(ordem: number): Endereco {
  return { rotulo: "", endereco_texto: "", mapa_embed_url: "", horarios: "", ordem, enabled: true, _new: true };
}

export function ContatosManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [telefones, setTelefones] = useState<Telefone[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);

  async function load() {
    setLoading(true);
    invalidateCmsCache("contatos");
    const d = await fetchSiteContatos(true);
    setTelefones(d.telefones);
    setEmails(d.emails);
    setEnderecos(d.enderecos);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  // ---------- helpers ----------
  function move<T extends { ordem: number }>(arr: T[], idx: number, dir: -1 | 1): T[] {
    const nxt = [...arr];
    const to = idx + dir;
    if (to < 0 || to >= nxt.length) return nxt;
    [nxt[idx], nxt[to]] = [nxt[to], nxt[idx]];
    return nxt.map((x, i) => ({ ...x, ordem: i }));
  }

  function patchTelefone(idx: number, p: Partial<Telefone>) {
    setTelefones((arr) => {
      let next = arr.map((t, i) => (i === idx ? { ...t, ...p } : t));
      // exclusividade do botão flutuante
      if (p.usar_no_botao_flutuante === true) {
        next = next.map((t, i) => (i === idx ? t : { ...t, usar_no_botao_flutuante: false }));
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      // upsert telefones
      for (const t of telefones) {
        const telExibido = formatBrazilPhoneDisplay(t.telefone_exibido.trim());
        if (telExibido && !isValidBrazilPhone(telExibido)) {
          toast.error(`Telefone inválido: "${t.telefone_exibido}". Use (XX) XXXXX-XXXX.`);
          setSaving(false);
          return;
        }
        const payload = {
          rotulo: (t.rotulo || "").trim() || null,
          telefone_exibido: telExibido,
          whatsapp_enabled: !!t.whatsapp_enabled,
          whatsapp_mensagem: t.whatsapp_enabled ? (t.whatsapp_mensagem?.trim() || null) : null,
          usar_no_botao_flutuante: !!t.usar_no_botao_flutuante && !!t.whatsapp_enabled,
          mostrar_no_header: !!t.mostrar_no_header,
          ordem: t.ordem,
          enabled: !!t.enabled,
          updated_at: new Date().toISOString(),
        };
        if (!payload.telefone_exibido) continue;
        if (t.id) {
          const { error } = await supabase.from("site_contato_telefones").update(payload).eq("id", t.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("site_contato_telefones").insert(payload);
          if (error) throw error;
        }
      }
      for (const e of emails) {
        const payload = {
          rotulo: (e.rotulo || "").trim() || null,
          email: e.email.trim(),
          ordem: e.ordem,
          enabled: !!e.enabled,
          updated_at: new Date().toISOString(),
        };
        if (!payload.email) continue;
        if (e.id) {
          const { error } = await supabase.from("site_contato_emails").update(payload).eq("id", e.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("site_contato_emails").insert(payload);
          if (error) throw error;
        }
      }
      for (const en of enderecos) {
        const payload = {
          rotulo: (en.rotulo || "").trim() || null,
          endereco_texto: en.endereco_texto.trim(),
          mapa_embed_url: (en.mapa_embed_url || "").trim() || null,
          horarios: (en.horarios || "").trim() || null,
          ordem: en.ordem,
          enabled: !!en.enabled,
          updated_at: new Date().toISOString(),
        };
        if (!payload.endereco_texto) continue;
        if (en.id) {
          const { error } = await supabase.from("site_contato_enderecos").update(payload).eq("id", en.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("site_contato_enderecos").insert(payload);
          if (error) throw error;
        }
      }
      invalidateCmsCache("contatos");
      toast.success("Contatos salvos");
      void load();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(table: "site_contato_telefones" | "site_contato_emails" | "site_contato_enderecos", id: string | undefined, refresh: () => void) {
    if (!id) { refresh(); return; }
    if (!confirm("Remover este contato?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidateCmsCache("contatos");
    refresh();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-border bg-card p-5">
        <h1 className="text-lg font-semibold">Contatos do site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre telefones, e-mails e endereços aqui. O rodapé, o header, o botão flutuante de WhatsApp
          e a seção de contato do site puxam desta central automaticamente.
        </p>
      </header>

      {/* ========= TELEFONES ========= */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#D67F43]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Telefones</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTelefones((a) => [...a, newTelefone(a.length)])}
          >
            <Plus className="mr-1 h-4 w-4" /> Adicionar telefone
          </Button>
        </div>
        {telefones.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum telefone cadastrado.</p>
        )}
        <div className="space-y-3">
          {telefones.map((t, idx) => {
            const trimmed = (t.telefone_exibido || "").trim();
            const valido = trimmed === "" || isValidBrazilPhone(trimmed);
            const preview = t.whatsapp_enabled && valido && trimmed
              ? buildWhatsappLink(trimmed, t.whatsapp_mensagem)
              : "";
            return (
              <div key={t.id ?? `new-${idx}`} className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Rótulo (opcional)</Label>
                    <Input
                      value={t.rotulo ?? ""}
                      onChange={(e) => patchTelefone(idx, { rotulo: e.target.value })}
                      placeholder="Ex: Unidade Gajé, Comercial"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefone exibido</Label>
                    <Input
                      value={t.telefone_exibido}
                      onChange={(e) => patchTelefone(idx, { telefone_exibido: e.target.value })}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (!v) return;
                        const formatted = formatBrazilPhoneDisplay(v);
                        if (formatted !== t.telefone_exibido) {
                          patchTelefone(idx, { telefone_exibido: formatted });
                        }
                      }}
                      placeholder="(11) 99999-9999"
                      className={!valido ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {!valido && (
                      <p className="text-xs text-red-500">
                        Formato inválido. Use (XX) XXXXX-XXXX para celular ou (XX) XXXX-XXXX para fixo.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/40 p-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={t.whatsapp_enabled}
                      onCheckedChange={(v) =>
                        patchTelefone(idx, {
                          whatsapp_enabled: v,
                          usar_no_botao_flutuante: v ? t.usar_no_botao_flutuante : false,
                        })
                      }
                    />
                    <span className="text-sm font-medium">Este número é WhatsApp</span>
                  </div>
                  {t.whatsapp_enabled && preview && (
                    <a
                      href={preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-[#D67F43] underline"
                    >
                      {preview}
                    </a>
                  )}
                </div>

                {t.whatsapp_enabled && (
                  <div className="space-y-1">
                    <Label className="text-xs">Mensagem pré-preenchida (opcional)</Label>
                    <Textarea
                      rows={2}
                      value={t.whatsapp_mensagem ?? ""}
                      onChange={(e) => patchTelefone(idx, { whatsapp_mensagem: e.target.value })}
                      placeholder="Olá! Vim pelo site e gostaria de mais informações."
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className={`flex items-center gap-2 rounded-md border p-2 text-sm ${t.whatsapp_enabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                    <input
                      type="checkbox"
                      disabled={!t.whatsapp_enabled}
                      checked={t.usar_no_botao_flutuante}
                      onChange={(e) => patchTelefone(idx, { usar_no_botao_flutuante: e.target.checked })}
                    />
                    Usar no botão flutuante
                  </label>
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.mostrar_no_header}
                      onChange={(e) => patchTelefone(idx, { mostrar_no_header: e.target.checked })}
                    />
                    Mostrar no header (barra superior)
                  </label>
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.enabled}
                      onChange={(e) => patchTelefone(idx, { enabled: e.target.checked })}
                    />
                    Ativo
                  </label>
                </div>

                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setTelefones((a) => move(a, idx, -1))} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setTelefones((a) => move(a, idx, 1))} disabled={idx === telefones.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => removeRow("site_contato_telefones", t.id, () => setTelefones((a) => a.filter((_, i) => i !== idx)))}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========= E-MAILS ========= */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#D67F43]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">E-mails</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEmails((a) => [...a, newEmail(a.length)])}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar e-mail
          </Button>
        </div>
        {emails.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum e-mail cadastrado.</p>
        )}
        <div className="space-y-3">
          {emails.map((e, idx) => (
            <div key={e.id ?? `new-${idx}`} className="grid grid-cols-1 items-end gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_2fr_auto_auto]">
              <div className="space-y-1">
                <Label className="text-xs">Rótulo</Label>
                <Input value={e.rotulo ?? ""} onChange={(ev) => setEmails((a) => a.map((x, i) => (i === idx ? { ...x, rotulo: ev.target.value } : x)))} placeholder="Ex: Comercial" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">E-mail</Label>
                <Input type="email" value={e.email} onChange={(ev) => setEmails((a) => a.map((x, i) => (i === idx ? { ...x, email: ev.target.value } : x)))} placeholder="contato@exemplo.com" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={e.enabled} onCheckedChange={(v) => setEmails((a) => a.map((x, i) => (i === idx ? { ...x, enabled: v } : x)))} />
                <span className="text-xs">Ativo</span>
              </div>
              <div className="flex justify-end gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEmails((a) => move(a, idx, -1))} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEmails((a) => move(a, idx, 1))} disabled={idx === emails.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => removeRow("site_contato_emails", e.id, () => setEmails((a) => a.filter((_, i) => i !== idx)))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========= ENDEREÇOS ========= */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#D67F43]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Endereços</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEnderecos((a) => [...a, newEndereco(a.length)])}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar endereço
          </Button>
        </div>
        {enderecos.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum endereço cadastrado.</p>
        )}
        <div className="space-y-3">
          {enderecos.map((en, idx) => (
            <div key={en.id ?? `new-${idx}`} className="rounded-lg border border-border p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
                <div className="space-y-1">
                  <Label className="text-xs">Rótulo (unidade)</Label>
                  <Input value={en.rotulo ?? ""} onChange={(ev) => setEnderecos((a) => a.map((x, i) => (i === idx ? { ...x, rotulo: ev.target.value } : x)))} placeholder="Ex: Unidade Engenheiro Goulart" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Endereço</Label>
                  <Input value={en.endereco_texto} onChange={(ev) => setEnderecos((a) => a.map((x, i) => (i === idx ? { ...x, endereco_texto: ev.target.value } : x)))} placeholder="Rua, número, bairro, cidade" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">URL do mapa embed (opcional)</Label>
                  <Input value={en.mapa_embed_url ?? ""} onChange={(ev) => setEnderecos((a) => a.map((x, i) => (i === idx ? { ...x, mapa_embed_url: ev.target.value } : x)))} placeholder="https://www.google.com/maps/embed?..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Horários (um por linha)</Label>
                  <Textarea
                    rows={2}
                    value={en.horarios ?? ""}
                    onChange={(ev) => setEnderecos((a) => a.map((x, i) => (i === idx ? { ...x, horarios: ev.target.value } : x)))}
                    placeholder={"Segunda a Sexta: 8h às 20h\nSábado: 8h às 14h"}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={en.enabled} onCheckedChange={(v) => setEnderecos((a) => a.map((x, i) => (i === idx ? { ...x, enabled: v } : x)))} />
                  Ativo
                </label>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEnderecos((a) => move(a, idx, -1))} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEnderecos((a) => move(a, idx, 1))} disabled={idx === enderecos.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => removeRow("site_contato_enderecos", en.id, () => setEnderecos((a) => a.filter((_, i) => i !== idx)))}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#D67F43] hover:bg-[#B85A24]">
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}