import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  blocosPreenchidos,
  fichaVazia,
  getFichaClinica,
  LIMITACOES,
  upsertFichaClinica,
  type FichaClinica,
  type MedicoExterno,
} from "@/lib/ficha-clinica";
import { fetchServicos } from "@/lib/configuracoes";
import { calcularIdade, formatTelefoneDisplay, type Paciente } from "@/lib/pacientes";

type BlocoKey = "atendimento" | "saude" | "medicos" | "escola" | "contato";
const ALL_BLOCKS: BlocoKey[] = ["atendimento", "saude", "medicos", "escola", "contato"];

export function FichaClinicaTab({ paciente }: { paciente: Paciente }) {
  const [ficha, setFicha] = useState<FichaClinica>(() => fichaVazia(paciente.id));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openBlocks, setOpenBlocks] = useState<Record<BlocoKey, boolean>>({
    atendimento: true,
    saude: true,
    medicos: false,
    escola: false,
    contato: false,
  });

  function toggleBlock(k: BlocoKey, v: boolean) {
    setOpenBlocks((s) => ({ ...s, [k]: v }));
  }
  function expandAll() {
    setOpenBlocks(Object.fromEntries(ALL_BLOCKS.map((k) => [k, true])) as Record<BlocoKey, boolean>);
  }
  function collapseAll() {
    setOpenBlocks(Object.fromEntries(ALL_BLOCKS.map((k) => [k, false])) as Record<BlocoKey, boolean>);
  }

  const fichaQ = useQuery({
    queryKey: ["ficha-clinica", paciente.id],
    queryFn: () => getFichaClinica(paciente.id),
  });

  const servicosQ = useQuery({
    queryKey: ["servicos-ativos"],
    queryFn: () => fetchServicos(false),
  });

  useEffect(() => {
    if (fichaQ.data) setFicha(fichaQ.data);
    else if (fichaQ.isFetched) setFicha(fichaVazia(paciente.id));
    setDirty(false);
  }, [fichaQ.data, fichaQ.isFetched, paciente.id]);

  function update<K extends keyof FichaClinica>(k: K, v: FichaClinica[K]) {
    setFicha((f) => ({ ...f, [k]: v }));
    setDirty(true);
  }

  function toggleArray(key: "especialidades_interesse" | "limitacoes", value: string) {
    setFicha((f) => {
      const cur = f[key];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...f, [key]: next };
    });
    setDirty(true);
  }

  function setMedico(i: number, patch: Partial<MedicoExterno>) {
    setFicha((f) => {
      const arr = [...f.medicos];
      arr[i] = { ...arr[i], ...patch };
      return { ...f, medicos: arr };
    });
    setDirty(true);
  }

  function addMedico() {
    if (ficha.medicos.length >= 5) return;
    setFicha((f) => ({
      ...f,
      medicos: [...f.medicos, { nome: "", especialidade: "", contato: "" }],
    }));
    setDirty(true);
  }

  function removeMedico(i: number) {
    setFicha((f) => ({ ...f, medicos: f.medicos.filter((_, idx) => idx !== i) }));
    setDirty(true);
  }

  async function handleSave() {
    try {
      setSaving(true);
      const saved = await upsertFichaClinica(ficha);
      setFicha(saved);
      setDirty(false);
      toast.success("Ficha clínica salva");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar ficha clínica");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(htmlFicha(paciente, ficha));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  if (fichaQ.isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const { total, preenchidos } = blocosPreenchidos(ficha);
  const servicos = servicosQ.data ?? [];

  const sumAtendimento = (() => {
    const partes: string[] = [];
    if (ficha.especialidades_interesse.length)
      partes.push(`${ficha.especialidades_interesse.length} especialidade(s)`);
    if (ficha.queixa_inicial) partes.push(ficha.queixa_inicial.split("\n")[0].slice(0, 50));
    return partes.join(" · ") || "—";
  })();
  const sumSaude = (() => {
    const partes: string[] = [];
    partes.push(ficha.limitacoes.length ? ficha.limitacoes.join(", ") : "Sem limitações");
    const flags = [
      ficha.alergias && "alergias",
      ficha.medicacao && "medicação",
      ficha.diagnosticos && "diagnósticos",
    ].filter(Boolean) as string[];
    if (flags.length) partes.push(flags.join(" · "));
    return partes.join(" · ");
  })();
  const sumMedicos = ficha.medicos.length
    ? `${ficha.medicos.length} profissional(is)`
    : "—";
  const sumEscola =
    [ficha.escola_turma, ficha.escola_professor].filter(Boolean).join(" · ") || "—";
  const sumContato = ficha.contato2_nome
    ? `${ficha.contato2_nome}${ficha.contato2_parentesco ? ` · ${ficha.contato2_parentesco}` : ""}`
    : "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ficha Clínica</h3>
          <p className="text-xs text-gray-500">
            {preenchidos} de {total} blocos preenchidos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={expandAll}>
            Expandir tudo
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={collapseAll}>
            Recolher tudo
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir ficha
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar ficha
          </Button>
        </div>
      </div>

      {/* A - Atendimento */}
      <Bloco
        titulo="Atendimento na clínica"
        open={openBlocks.atendimento}
        onOpenChange={(v) => toggleBlock("atendimento", v)}
        summary={sumAtendimento}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Campo label="Data de abertura">
            <Input
              type="date"
              value={ficha.data_abertura ?? ""}
              onChange={(e) => update("data_abertura", e.target.value || null)}
            />
          </Campo>
          <div className="md:col-span-3">
            <Label className="text-sm text-gray-700">Especialidades de interesse</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {servicos.length === 0 && (
                <span className="text-xs text-gray-400">
                  Nenhum serviço ativo cadastrado em Configurações.
                </span>
              )}
              {servicos.map((s) => {
                const checked = ficha.especialidades_interesse.includes(s.nome);
                return (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleArray("especialidades_interesse", s.nome)}
                    />
                    {s.nome}
                  </label>
                );
              })}
            </div>
          </div>
          <Campo label="Queixa inicial / motivo da procura" className="md:col-span-3">
            <Textarea
              rows={3}
              value={ficha.queixa_inicial ?? ""}
              onChange={(e) => update("queixa_inicial", e.target.value || null)}
            />
          </Campo>
        </div>
      </Bloco>

      {/* B - Saúde */}
      <Bloco
        titulo="Saúde"
        open={openBlocks.saude}
        onOpenChange={(v) => toggleBlock("saude", v)}
        summary={sumSaude}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label className="text-sm text-gray-700">Limitações</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {LIMITACOES.map((l) => {
                const checked = ficha.limitacoes.includes(l);
                return (
                  <label
                    key={l}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleArray("limitacoes", l)}
                    />
                    {l}
                  </label>
                );
              })}
            </div>
          </div>
          {ficha.limitacoes.includes("Outras") && (
            <Campo label="Quais outras limitações?" className="md:col-span-2">
              <Input
                value={ficha.limitacoes_outras ?? ""}
                onChange={(e) => update("limitacoes_outras", e.target.value || null)}
              />
            </Campo>
          )}
          <Campo label="Alergias">
            <Input
              value={ficha.alergias ?? ""}
              onChange={(e) => update("alergias", e.target.value || null)}
            />
          </Campo>
          <Campo label="Medicação em uso">
            <Input
              value={ficha.medicacao ?? ""}
              onChange={(e) => update("medicacao", e.target.value || null)}
            />
          </Campo>
          <Campo label="Diagnósticos / hipótese diagnóstica" className="md:col-span-2">
            <Textarea
              rows={2}
              value={ficha.diagnosticos ?? ""}
              onChange={(e) => update("diagnosticos", e.target.value || null)}
            />
          </Campo>
        </div>
      </Bloco>

      {/* C - Médicos */}
      <Bloco
        titulo="Médicos e profissionais externos"
        open={openBlocks.medicos}
        onOpenChange={(v) => toggleBlock("medicos", v)}
        summary={sumMedicos}
      >
        <div className="space-y-3">
          {ficha.medicos.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum profissional adicionado.</p>
          )}
          {ficha.medicos.map((m, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <Input
                placeholder="Nome"
                value={m.nome}
                onChange={(e) => setMedico(i, { nome: e.target.value })}
              />
              <Input
                placeholder="Especialidade"
                value={m.especialidade}
                onChange={(e) => setMedico(i, { especialidade: e.target.value })}
              />
              <Input
                placeholder="Contato"
                value={m.contato}
                onChange={(e) => setMedico(i, { contato: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMedico(i)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {ficha.medicos.length < 5 && (
            <Button type="button" variant="outline" size="sm" onClick={addMedico}>
              <Plus className="mr-1.5 h-4 w-4" />
              Adicionar profissional
            </Button>
          )}
        </div>
      </Bloco>

      {/* D - Escola */}
      <Bloco
        titulo="Escola (detalhes)"
        open={openBlocks.escola}
        onOpenChange={(v) => toggleBlock("escola", v)}
        summary={sumEscola}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Campo label="Telefone da escola">
            <Input
              value={ficha.escola_telefone ?? ""}
              onChange={(e) => update("escola_telefone", e.target.value || null)}
            />
          </Campo>
          <Campo label="Turma">
            <Input
              value={ficha.escola_turma ?? ""}
              onChange={(e) => update("escola_turma", e.target.value || null)}
            />
          </Campo>
          <Campo label="Professor(a)">
            <Input
              value={ficha.escola_professor ?? ""}
              onChange={(e) => update("escola_professor", e.target.value || null)}
            />
          </Campo>
          <Campo label="Coordenação">
            <Input
              value={ficha.escola_coordenacao ?? ""}
              onChange={(e) => update("escola_coordenacao", e.target.value || null)}
            />
          </Campo>
          <Campo label="Observações da escola" className="md:col-span-3">
            <Textarea
              rows={2}
              value={ficha.escola_observacoes ?? ""}
              onChange={(e) => update("escola_observacoes", e.target.value || null)}
            />
          </Campo>
        </div>
      </Bloco>

      {/* E - Outro contato */}
      <Bloco
        titulo="Contato familiar adicional"
        open={openBlocks.contato}
        onOpenChange={(v) => toggleBlock("contato", v)}
        summary={sumContato}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Campo label="Nome">
            <Input
              value={ficha.contato2_nome ?? ""}
              onChange={(e) => update("contato2_nome", e.target.value || null)}
            />
          </Campo>
          <Campo label="Parentesco">
            <Input
              value={ficha.contato2_parentesco ?? ""}
              onChange={(e) => update("contato2_parentesco", e.target.value || null)}
            />
          </Campo>
          <Campo label="Celular">
            <Input
              value={ficha.contato2_celular ?? ""}
              onChange={(e) => update("contato2_celular", e.target.value || null)}
            />
          </Campo>
          <Campo label="E-mail">
            <Input
              type="email"
              value={ficha.contato2_email ?? ""}
              onChange={(e) => update("contato2_email", e.target.value || null)}
            />
          </Campo>
        </div>
      </Bloco>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-gradient-to-r from-[#D67F43] to-[#B85A24] text-white hover:opacity-90"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar ficha
        </Button>
      </div>
    </div>
  );
}

function Bloco({
  titulo,
  children,
  open,
  onOpenChange,
  summary,
}: {
  titulo: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  summary?: string;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="rounded-lg border border-gray-200 bg-white">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#7A3B14]">
              {titulo}
            </h4>
            {!open && summary && (
              <span className="truncate text-xs text-gray-500">— {summary}</span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-gray-100 p-5">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Campo({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label className="text-sm text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

function htmlFicha(p: Paciente, f: FichaClinica): string {
  const idade = calcularIdade(p.data_nascimento);
  const esc = (s: string | null | undefined) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linha = (label: string, value: string | null | undefined) =>
    `<div class="row"><span class="lbl">${label}:</span> <span>${esc(value) || "—"}</span></div>`;
  const checkbox = (v: boolean, label: string) =>
    `<span class="chk">[${v ? "x" : " "}] ${label}</span>`;
  const dataAbertura = f.data_abertura
    ? new Date(f.data_abertura + "T00:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");
  const dataNasc = p.data_nascimento
    ? new Date(p.data_nascimento + "T00:00:00").toLocaleDateString("pt-BR")
    : "—";
  const medicos = f.medicos.length
    ? f.medicos
        .map(
          (m) =>
            `<div class="row">${esc(m.nome) || "—"} — ${esc(m.especialidade) || "—"} <span class="muted">Ctt: ${esc(m.contato) || "—"}</span></div>`,
        )
        .join("")
    : '<div class="muted">—</div>';

  return `<!doctype html><html lang="pt-BR"><head>
    <meta charset="utf-8" />
    <title>Ficha — ${esc(p.nome)}</title>
    <style>
      body{font-family:system-ui,sans-serif;color:#111;margin:24px;font-size:13px;}
      .header{border-bottom:2px solid #D67F43;padding-bottom:8px;margin-bottom:16px;}
      .header h1{margin:0;font-size:18px;color:#7A3B14;}
      .header .sub{font-size:11px;color:#666;}
      .secao{margin-top:14px;padding:10px 12px;border:1px solid #e5e5e5;border-radius:6px;page-break-inside:avoid;}
      .secao h2{margin:0 0 8px;font-size:12px;color:#7A3B14;text-transform:uppercase;letter-spacing:.5px;}
      .row{margin:3px 0;}
      .lbl{color:#666;font-weight:600;}
      .chk{display:inline-block;margin-right:14px;}
      .muted{color:#999;}
      footer{margin-top:18px;border-top:1px solid #ddd;padding-top:8px;font-size:10px;color:#666;text-align:center;}
      @media print { body{margin:12mm} }
    </style>
  </head><body>
    <div class="header">
      <h1>Estação Aprender — Ficha do Paciente</h1>
      <div class="sub">Praça Gajé, 56 — Engenheiro Goulart, São Paulo/SP — (11) 2621-9800</div>
      <div class="sub">Data de abertura: <strong>${esc(dataAbertura)}</strong></div>
    </div>

    <div class="secao">
      <h2>Identificação</h2>
      ${linha("Nome completo", p.nome)}
      ${linha("Data de nascimento", `${dataNasc}${idade !== null ? ` (${idade} anos)` : ""}`)}
      ${linha("CPF", p.cpf)}
      <div class="row"><span class="lbl">Sexo:</span>
        ${checkbox(p.sexo === "M", "M")}${checkbox(p.sexo === "F", "F")}${checkbox(p.sexo === "O", "Outro")}
      </div>
      ${linha("Endereço", [p.endereco, p.numero, p.complemento, p.bairro, p.cidade, p.estado].filter(Boolean).join(", "))}
      ${linha("Celular", formatTelefoneDisplay(p.telefone_celular))}
      ${linha("E-mail", p.email)}
    </div>

    <div class="secao">
      <h2>Atendimento</h2>
      <div class="row"><span class="lbl">Especialidades:</span> ${
        f.especialidades_interesse.length
          ? f.especialidades_interesse.map(esc).join(" • ")
          : '<span class="muted">—</span>'
      }</div>
      ${linha("Queixa / motivo", f.queixa_inicial)}
    </div>

    <div class="secao">
      <h2>Saúde</h2>
      <div class="row"><span class="lbl">Limitações:</span>
        ${["Cognitiva", "Locomoção", "Visão", "Audição", "Outras"]
          .map((l) => checkbox(f.limitacoes.includes(l), l))
          .join("")}
      </div>
      ${f.limitacoes.includes("Outras") ? linha("Outras", f.limitacoes_outras) : ""}
      ${linha("Alergias", f.alergias)}
      ${linha("Medicação", f.medicacao)}
      ${linha("Diagnósticos", f.diagnosticos)}
    </div>

    <div class="secao">
      <h2>Médicos / profissionais externos</h2>
      ${medicos}
    </div>

    <div class="secao">
      <h2>Escolaridade</h2>
      ${linha("Nível", p.escolaridade_nivel)}
      ${linha("Escola", p.escola_nome)}
      ${linha("Telefone", f.escola_telefone)}
      ${linha("Turma", f.escola_turma)}
      ${linha("Professor(a)", f.escola_professor)}
      ${linha("Coordenação", f.escola_coordenacao)}
      ${linha("Observações", f.escola_observacoes)}
    </div>

    <div class="secao">
      <h2>Responsáveis</h2>
      ${linha("Responsável principal", `${p.responsavel_nome ?? "—"}${p.responsavel_parentesco ? ` (${p.responsavel_parentesco})` : ""}`)}
      ${linha("Segundo responsável", p.responsavel2_nome ? `${p.responsavel2_nome}${p.responsavel2_parentesco ? ` (${p.responsavel2_parentesco})` : ""} — ${formatTelefoneDisplay(p.responsavel2_celular)}` : "—")}
      ${linha("Contato familiar adicional", f.contato2_nome ? `${f.contato2_nome}${f.contato2_parentesco ? ` (${f.contato2_parentesco})` : ""} — ${f.contato2_celular ?? "—"} ${f.contato2_email ? `· ${f.contato2_email}` : ""}` : "—")}
    </div>

    <footer>Documento confidencial — Estação Aprender</footer>
    <script>window.onafterprint = () => window.close();</script>
  </body></html>`;
}