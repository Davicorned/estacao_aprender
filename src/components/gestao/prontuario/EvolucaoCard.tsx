import { useState } from "react";
import { ChevronDown, ChevronUp, Lock, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDataBr, type EvolucaoComJoin } from "@/lib/evolucoes";

type Props = {
  evolucao: EvolucaoComJoin;
  pacienteNome: string;
  onEdit: () => void;
};

export function EvolucaoCard({ evolucao, pacienteNome, onEdit }: Props) {
  const [open, setOpen] = useState(false);
  const prof = evolucao.profissional;
  const especialidade = prof?.especialidades?.[0] ?? prof?.titulo ?? "";
  const preview = (evolucao.evolucao ?? evolucao.observacao ?? "")
    .replace(/\s+/g, " ")
    .slice(0, 160);

  function handlePrint() {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(htmlImpressao([evolucao], pacienteNome));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span aria-hidden>📅</span>
            <span className="font-semibold text-gray-900">
              {formatDataBr(evolucao.data_sessao)}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">{prof?.nome ?? "—"}</span>
            {evolucao.privado && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                <Lock className="h-3 w-3" /> Privado
              </span>
            )}
          </div>
          {especialidade && (
            <div className="text-xs text-gray-500">{especialidade}</div>
          )}
          {!open && preview && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{preview}</p>
          )}
        </div>
        {open ? (
          <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-4 text-sm">
          <Bloco titulo="Queixa" texto={evolucao.queixa} />
          <Bloco titulo="Observação da sessão" texto={evolucao.observacao} />
          <Bloco titulo="Evolução" texto={evolucao.evolucao} />
          <Bloco titulo="Instrumentos utilizados" texto={evolucao.instrumentos} />
          <Bloco titulo="Plano terapêutico" texto={evolucao.plano} />
          <Bloco titulo="Encaminhamentos" texto={evolucao.encaminhamentos} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Editar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Imprimir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {titulo}
      </div>
      <p className="mt-0.5 whitespace-pre-wrap text-gray-800">{texto}</p>
    </div>
  );
}

export function htmlImpressao(
  evolucoes: EvolucaoComJoin[],
  pacienteNome: string,
): string {
  const linhas = evolucoes
    .map((e) => {
      const blocos: string[] = [];
      const add = (t: string, v: string | null) => {
        if (v) blocos.push(`<div class="bloco"><strong>${t}</strong><p>${escape(v)}</p></div>`);
      };
      add("Queixa", e.queixa);
      add("Observação da sessão", e.observacao);
      add("Evolução", e.evolucao);
      add("Instrumentos utilizados", e.instrumentos);
      add("Plano terapêutico", e.plano);
      add("Encaminhamentos", e.encaminhamentos);
      return `
        <div class="evolucao">
          <div class="cab">
            <strong>${formatDataBr(e.data_sessao)}</strong>
            <span> — ${escape(e.profissional?.nome ?? "—")}</span>
          </div>
          ${blocos.join("")}
        </div>
      `;
    })
    .join("");

  return `<!doctype html><html lang="pt-BR"><head>
    <meta charset="utf-8" />
    <title>Prontuário — ${escape(pacienteNome)}</title>
    <style>
      body{font-family:system-ui,sans-serif;color:#111;margin:24px;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #D67F43;padding-bottom:8px;margin-bottom:16px;}
      .header h1{margin:0;font-size:18px;color:#7A3B14;}
      .conf{background:#7A3B14;color:white;padding:2px 8px;font-size:11px;border-radius:4px;letter-spacing:1px;}
      .evolucao{border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;page-break-inside:avoid;}
      .cab{margin-bottom:8px;font-size:14px;color:#333;}
      .bloco{margin-top:8px;font-size:13px;}
      .bloco strong{display:block;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
      .bloco p{margin:0;white-space:pre-wrap;}
      footer{margin-top:24px;border-top:1px solid #ddd;padding-top:8px;font-size:11px;color:#666;text-align:center;}
      @media print { body{margin:12mm} }
    </style>
  </head><body>
    <div class="header">
      <div>
        <h1>Estação Aprender — Prontuário</h1>
        <div>Paciente: <strong>${escape(pacienteNome)}</strong></div>
        <div>Emitido em: ${new Date().toLocaleString("pt-BR")}</div>
      </div>
      <div class="conf">CONFIDENCIAL</div>
    </div>
    ${linhas || "<p>Sem evoluções registradas.</p>"}
    <footer>Documento confidencial — Estação Aprender</footer>
    <script>window.onafterprint = () => window.close();</script>
  </body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}