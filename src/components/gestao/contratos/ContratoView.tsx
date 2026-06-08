import { useEffect, useRef, useState } from "react";
import { Printer, MessageCircle, Download, Paperclip, FileText, Eye, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
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
    const margin = 20;
    const maxW = pageW - margin * 2;

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Estação Aprender", margin, 12);
    doc.text(new Date().toLocaleDateString("pt-BR"), pageW - margin, 12, { align: "right" });

    doc.setTextColor(20);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(contrato.termos ?? "", maxW);
    let y = margin;
    const lineH = 5.2;
    for (const ln of lines) {
      if (y + lineH > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += lineH;
    }

    const nome = (contrato.paciente?.nome ?? "contrato").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const data = contrato.data_inicio ?? "";
    doc.save(`Contrato-${nome}-${data}.pdf`);
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
      const proxied = `/api/file-proxy?url=${encodeURIComponent(url)}`;
      window.open(proxied, "_blank");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao abrir arquivo");
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