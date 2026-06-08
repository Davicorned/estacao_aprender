import { useEffect, useRef, useState } from "react";
import { Printer, MessageCircle, Download, Paperclip, FileText, Eye, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  whatsappLink,
  uploadContratoAssinado,
  getContratoAssinadoUrl,
  removeContratoAssinado,
  ARQUIVO_ASSINADO_MIMES,
  aplicarTemplate,
  montarVariaveis,
  TEMPLATE_ASSINATURA,
  TEMPLATE_AUTORIZACAO_IMAGEM,
  type DadosResponsavel,
  type FormaPagamento,
  type Modalidade,
  type ContratoComJoin,
} from "@/lib/contratos";

type Props = {
  contrato: ContratoComJoin;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged?: () => void;
};

export function ContratoView({ contrato, open, onOpenChange, onChanged }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [localAnexo, setLocalAnexo] = useState<{
    path: string | null;
    uploaded_at: string | null;
    mime: string | null;
  }>({
    path: contrato.arquivo_assinado_path,
    uploaded_at: contrato.arquivo_assinado_uploaded_at,
    mime: contrato.arquivo_assinado_mime,
  });

  useEffect(() => {
    setLocalAnexo({
      path: contrato.arquivo_assinado_path,
      uploaded_at: contrato.arquivo_assinado_uploaded_at,
      mime: contrato.arquivo_assinado_mime,
    });
  }, [contrato.id, contrato.arquivo_assinado_path, contrato.arquivo_assinado_uploaded_at, contrato.arquivo_assinado_mime]);

  function handlePrint() {
    window.print();
  }

  function handleWhatsapp() {
    const tel = contrato.paciente?.telefone_celular ?? "";
    const msg = `Olá! Segue o contrato de prestação de serviços da Estação Aprender para ${contrato.paciente?.nome ?? "você"}. Qualquer dúvida estamos à disposição.`;
    window.open(whatsappLink(tel, msg), "_blank");
  }

  function handleDownloadPdf() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const topY = 28;
    const bottomY = pageH - 18;
    const maxW = pageW - margin * 2;

    function drawHeader() {
      // Faixa decorativa
      doc.setFillColor(214, 127, 67); // #D67F43
      doc.rect(0, 0, pageW, 14, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("estação aprender", margin, 9.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "Psicopedagogia · Psicomotricidade · Psicologia · Neuropsicologia · Alfabetização",
        pageW - margin,
        9.5,
        { align: "right" },
      );
      doc.setTextColor(20, 20, 20);
    }

    function drawFooter(pageNum: number, total: number) {
      doc.setDrawColor(214, 127, 67);
      doc.setLineWidth(0.3);
      doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text("(11) 2621-9800 · (11) 9 3213-9800 · @estacaoaprender_", margin, pageH - 9);
      doc.text("Praça Gajé n° 56 — Conj. 1, Engenheiro Goulart, São Paulo", margin, pageH - 5);
      doc.text(`${pageNum} / ${total}`, pageW - margin, pageH - 5, { align: "right" });
      doc.setTextColor(20, 20, 20);
    }

    // Monta variáveis e textos
    const vars = montarVariaveis({
      paciente_nome: contrato.paciente?.nome ?? "",
      responsavel: (contrato.dados_responsavel as DadosResponsavel | null) ?? null,
      servico_nome: contrato.servico?.nome ?? "",
      modalidade: (contrato.modalidade as Modalidade | null) ?? null,
      aulas_por_mes: contrato.aulas_por_mes,
      valor_com_desconto_centavos: contrato.valor_com_desconto_centavos,
      valor_sem_desconto_centavos: contrato.valor_sem_desconto_centavos,
      forma_pagamento: (contrato.forma_pagamento as FormaPagamento | null) ?? null,
      dia_vencimento: contrato.dia_vencimento,
      cidade_assinatura: contrato.cidade_assinatura,
      autoriza_imagem: contrato.autoriza_imagem,
      data_inicio: contrato.data_inicio,
      data_termino: contrato.data_termino,
      frequencia: contrato.frequencia,
      qtd_sessoes: contrato.qtd_sessoes,
    });

    const corpo = aplicarTemplate(contrato.termos ?? "", vars);
    const assinatura = aplicarTemplate(TEMPLATE_ASSINATURA, vars);
    const autorizacao = aplicarTemplate(TEMPLATE_AUTORIZACAO_IMAGEM, vars);

    // Renderiza blocos com cabeçalhos detectados
    const lineH = 5.0;
    let y = topY;

    function ensureSpace(h: number) {
      if (y + h > bottomY) {
        doc.addPage();
        drawHeader();
        y = topY;
      }
    }

    function writeBlock(text: string, opts?: { bold?: boolean; size?: number; gapAfter?: number }) {
      doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
      doc.setFontSize(opts?.size ?? 10);
      const lines = doc.splitTextToSize(text, maxW);
      for (const ln of lines) {
        ensureSpace(lineH);
        doc.text(ln, margin, y);
        y += lineH;
      }
      y += opts?.gapAfter ?? 1.5;
    }

    drawHeader();

    // Título principal
    const paragrafos = corpo.split(/\n\s*\n/);
    for (const p of paragrafos) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      // Heurística: parágrafos curtos em CAIXA ALTA ou que começam com número+ponto viram negrito
      const isHeading =
        /^[0-9]+\.\s*[A-ZÀ-Ú]/.test(trimmed) ||
        (trimmed === trimmed.toUpperCase() && trimmed.length < 90);
      writeBlock(trimmed, { bold: isHeading, size: isHeading ? 11 : 10, gapAfter: isHeading ? 1 : 3 });
    }

    // Página de assinatura
    doc.addPage();
    drawHeader();
    y = topY;
    writeBlock("TERMO DE CIÊNCIA E ASSINATURA", { bold: true, size: 12, gapAfter: 5 });
    for (const p of assinatura.split(/\n\s*\n/)) {
      writeBlock(p.trim(), { gapAfter: 3 });
    }

    // Anexo: autorização de imagem
    doc.addPage();
    drawHeader();
    y = topY;
    const parsAuto = autorizacao.split(/\n\s*\n/);
    for (let i = 0; i < parsAuto.length; i++) {
      const t = parsAuto[i].trim();
      if (!t) continue;
      const isTitle = i === 0;
      writeBlock(t, { bold: isTitle, size: isTitle ? 12 : 10, gapAfter: isTitle ? 5 : 3 });
    }

    // Rodapés em todas as páginas
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      drawFooter(p, total);
    }

    const nome = (contrato.paciente?.nome ?? "contrato").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const data = contrato.data_inicio ?? "";
    doc.save(`Contrato-${nome}-${data}.pdf`);
  }

  const getAnexoFilename = () => {
    const nome = (contrato.paciente?.nome ?? "contrato").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const ext = localAnexo.mime === "application/pdf" ? "pdf" : localAnexo.mime === "image/png" ? "png" : "jpg";
    return `Contrato-assinado-${nome}.${ext}`;
  };

  function buildProxyUrl(signedUrl: string, opts?: { download?: boolean }) {
    // base64url-encode the signed URL so adblockers/Chrome filters don't see
    // the literal "supabase.co" host or storage token in the request URL.
    const b64 = btoa(signedUrl)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const filename = getAnexoFilename();
    let url = `/api/public/file-proxy/${b64}/${encodeURIComponent(filename)}`;
    if (opts?.download) {
      url += `?download=1&filename=${encodeURIComponent(filename)}`;
    }
    return url;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const newPath = await uploadContratoAssinado(contrato.id, file);
      toast.success("Contrato assinado anexado");
      setLocalAnexo({
        path: newPath,
        uploaded_at: new Date().toISOString(),
        mime: file.type,
      });
      onChanged?.();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  }

  async function handleViewSigned() {
    if (!localAnexo.path) return;
    try {
      const url = await getContratoAssinadoUrl(localAnexo.path);
      setViewerUrl(buildProxyUrl(url));
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao abrir arquivo");
    }
  }

  async function handleDownloadSigned() {
    if (!localAnexo.path) return;
    try {
      const url = await getContratoAssinadoUrl(localAnexo.path);
      window.location.href = buildProxyUrl(url, { download: true });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao baixar arquivo");
    }
  }

  async function handleRemoveSigned() {
    if (!localAnexo.path) return;
    if (!confirm("Remover o contrato assinado anexado?")) return;
    setRemoving(true);
    try {
      await removeContratoAssinado(contrato.id, localAnexo.path);
      toast.success("Anexo removido");
      setLocalAnexo({ path: null, uploaded_at: null, mime: null });
      onChanged?.();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao remover");
    } finally {
      setRemoving(false);
    }
  }

  const dataUploadFmt = localAnexo.uploaded_at
    ? new Date(localAnexo.uploaded_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle>Contrato — {contrato.paciente?.nome}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" /> Baixar PDF
          </Button>
          <Button onClick={handleWhatsapp} className="bg-green-600 text-white hover:bg-green-700">
            <MessageCircle className="mr-2 h-4 w-4" /> Enviar por WhatsApp
          </Button>
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-4 print:hidden">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-900">
            <Paperclip className="h-4 w-4" /> Contrato assinado (scan)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ARQUIVO_ASSINADO_MIMES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          {localAnexo.path ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="h-4 w-4 text-amber-700" />
                <span>
                  Anexado{dataUploadFmt ? ` em ${dataUploadFmt}` : ""}
                  {localAnexo.mime ? ` · ${localAnexo.mime}` : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleViewSigned}>
                  <Eye className="mr-1 h-4 w-4" /> Ver
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadSigned}>
                  <Download className="mr-1 h-4 w-4" /> Baixar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-4 w-4" />
                  )}
                  Substituir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveSigned}
                  disabled={removing}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                Nenhum contrato assinado anexado. Aceita PDF, JPG ou PNG (até 10MB).
              </p>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-[#D67F43] to-[#E89B6D] text-white"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="mr-2 h-4 w-4" />
                )}
                Anexar contrato assinado
              </Button>
            </div>
          )}
        </div>

        <article className="contrato-print mx-auto mt-4 w-full max-w-[210mm] rounded-md border border-amber-100 bg-white p-8 font-serif text-sm leading-relaxed text-gray-800 shadow-sm print:m-0 print:max-w-none print:border-0 print:p-0 print:shadow-none">
          <pre className="whitespace-pre-wrap break-words font-serif">{contrato.termos}</pre>
        </article>

        <Dialog open={!!viewerUrl} onOpenChange={(nextOpen) => !nextOpen && setViewerUrl(null)}>
          <DialogContent className="h-[92vh] max-w-5xl overflow-hidden p-0">
            <DialogHeader className="border-b px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                <DialogTitle>Contrato assinado — {contrato.paciente?.nome}</DialogTitle>
                <Button size="sm" variant="outline" onClick={handleDownloadSigned}>
                  <Download className="mr-1 h-4 w-4" /> Baixar
                </Button>
              </div>
            </DialogHeader>
            {viewerUrl ? (
              localAnexo.mime?.startsWith("image/") ? (
                <div className="flex h-[calc(92vh-64px)] items-center justify-center overflow-auto bg-muted p-4">
                  <img src={viewerUrl} alt="Contrato assinado anexado" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <iframe title="Contrato assinado anexado" src={viewerUrl} className="h-[calc(92vh-64px)] w-full border-0" />
              )
            ) : null}
          </DialogContent>
        </Dialog>

        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .contrato-print, .contrato-print * { visibility: visible !important; }
            .contrato-print { position: absolute; left: 0; top: 0; width: 100%; }
            @page { size: A4; margin: 20mm; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}