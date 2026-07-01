import { useEffect, useRef, useState } from "react";
import { Printer, MessageCircle, Download, Paperclip, FileText, Eye, RefreshCw, Trash2, Loader2, DollarSign, Palette } from "lucide-react";
import { toast } from "sonner";
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
import { gerarMensalidadeContrato } from "@/lib/financeiro";
import { fetchDocumentoEstilo, DOC_ESTILO_DEFAULTS } from "@/lib/documento-estilo";
import { buildHeaderHtml, buildFooterHtml, getContentMetrics, PAGE_W, PAGE_H } from "@/lib/documento-pdf";
import { fetchClinica } from "@/lib/configuracoes";
import { publicImageUrl } from "@/integrations/supabase/client";
import { DocumentoEstiloDialog } from "@/components/gestao/config/DocumentoEstiloDialog";

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
  const [gerandoMensalidade, setGerandoMensalidade] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [estiloOpen, setEstiloOpen] = useState(false);
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

  async function handleGerarMensalidade() {
    setGerandoMensalidade(true);
    try {
      const r = await gerarMensalidadeContrato(contrato, { primeira: false });
      if (r.created) toast.success(`Mensalidade ${r.mes} gerada`);
      else if (r.reason === "ja_existe") toast.info(`Mensalidade ${r.mes} já existe`);
      else if (r.reason === "not_mensal") toast.error("Disponível só para Pacote Mensal");
      else if (r.reason === "sem_dia_vencimento") toast.error("Contrato sem dia de vencimento");
      else if (r.reason === "valor_zero") toast.error("Valor mensal inválido");
      onChanged?.();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao gerar mensalidade");
    } finally {
      setGerandoMensalidade(false);
    }
  }

  async function handleDownloadPdf() {
    setGeneratingPdf(true);
    try {
      const [{ jsPDF }, h2c] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ]);
      const html2canvas = h2c.default;
      const [cfg, clinica] = await Promise.all([
        fetchDocumentoEstilo().catch(() => DOC_ESTILO_DEFAULTS),
        fetchClinica().catch(() => null),
      ]);
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

      // Sections (each is a sequence of paragraphs flowed across pages independently)
      type Block = { text: string; heading?: boolean; title?: boolean };
      const corpoBlocks: Block[] = corpo
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((t) => {
          const isHeading =
            /^[0-9]+\.\s*[A-ZÀ-Ú]/.test(t) ||
            (t === t.toUpperCase() && t.length < 90);
          return { text: t, heading: isHeading };
        });

      const assinaturaBlocks: Block[] = [
        { text: "TERMO DE CIÊNCIA E ASSINATURA", title: true },
        ...assinatura.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((t) => ({ text: t })),
      ];

      const autorizacaoParts = autorizacao.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const autorizacaoBlocks: Block[] = autorizacaoParts.map((t, i) => ({
        text: t,
        title: i === 0,
      }));

      const sections: Block[][] = [corpoBlocks, assinaturaBlocks, autorizacaoBlocks];

      const metrics = getContentMetrics(cfg);
      const CONTENT_TOP = metrics.top;
      const CONTENT_BOTTOM = PAGE_H - metrics.bottom;
      const CONTENT_MAX_H = CONTENT_BOTTOM - CONTENT_TOP;

      const root = document.createElement("div");
      root.setAttribute("data-pdf-root", "");
      Object.assign(root.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: `${PAGE_W}px`,
        background: "#ffffff",
        fontFamily: `'${cfg.fonte}', 'Inter', system-ui, -apple-system, sans-serif`,
        color: "#1f1f1f",
        zIndex: "-1",
      } as CSSStyleDeclaration);
      document.body.appendChild(root);

      function svgToPngDataUrl(svg: string, width: number, height: number) {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Não foi possível preparar o logo"));
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => reject(new Error("Não foi possível carregar o logo"));
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        });
      }

      // Resolve logo: config first, otherwise fallback to Estação Aprender SVG recolored.
      let logoSrc: string | null = null;
      if (cfg.logo_url) {
        logoSrc = publicImageUrl(cfg.logo_url);
      } else {
        try {
          const res = await fetch(logoAsset.url);
          if (res.ok) {
            let svg = await res.text();
            const tint = cfg.header_texto_cor || "#FFFFFF";
            svg = svg
              .replace(/<\?xml[^?]*\?>/, "")
              .replace(/<!--([\s\S]*?)-->/g, "")
              .replace(/#D67F43/gi, tint)
              .replace(/#724B36/gi, tint)
              .trim();
            logoSrc = await svgToPngDataUrl(svg, 190, 107);
          }
        } catch (e) {
          console.warn("Falha ao carregar logo padrão", e);
        }
      }

      const renderCtx = { logoSrc, clinica };
      const headerHtml = buildHeaderHtml(cfg, renderCtx);
      const footerHtml = (pageNum: number, total: number) =>
        buildFooterHtml(cfg, { ...renderCtx, pageNum, total });

      function createPage(): HTMLDivElement {
        const page = document.createElement("div");
        Object.assign(page.style, {
          position: "relative",
          width: `${PAGE_W}px`,
          height: `${PAGE_H}px`,
          background: "#fff",
          overflow: "hidden",
          pageBreakAfter: "always",
        } as CSSStyleDeclaration);
        page.innerHTML = headerHtml;
        const content = document.createElement("div");
        Object.assign(content.style, {
          position: "absolute",
          top: `${CONTENT_TOP}px`,
          left: `${metrics.left}px`,
          right: `${metrics.right}px`,
          maxHeight: `${CONTENT_MAX_H}px`,
          overflow: "hidden",
          fontSize: "12.5px",
          lineHeight: "1.65",
          textAlign: "justify",
          color: "#222",
        } as CSSStyleDeclaration);
        content.setAttribute("data-content", "");
        page.appendChild(content);
        return page;
      }

      function renderBlock(block: Block): HTMLDivElement {
        const el = document.createElement("div");
        if (block.title) {
          el.style.cssText =
            "font-size:16px;font-weight:700;margin:0 0 16px 0;color:#1a1a1a;text-align:left;letter-spacing:0.01em;";
        } else if (block.heading) {
          el.style.cssText =
            "font-size:13px;font-weight:700;margin:14px 0 6px 0;color:#1a1a1a;text-align:left;";
        } else {
          el.style.cssText = "margin:0 0 10px 0;";
        }
        el.textContent = block.text;
        return el;
      }

      // Layout sections page-by-page
      const pages: HTMLDivElement[] = [];
      for (const section of sections) {
        let page = createPage();
        root.appendChild(page);
        pages.push(page);
        let content = page.querySelector("[data-content]") as HTMLDivElement;

        for (const block of section) {
          const el = renderBlock(block);
          content.appendChild(el);
          if (content.scrollHeight > CONTENT_MAX_H) {
            // overflow → move block to new page
            content.removeChild(el);
            page = createPage();
            root.appendChild(page);
            pages.push(page);
            content = page.querySelector("[data-content]") as HTMLDivElement;
            content.appendChild(el);
          }
        }
      }

      // Append footers with final pagination
      const total = pages.length;
      pages.forEach((page, i) => {
        const html = footerHtml(i + 1, total);
        if (!html) return;
        const footer = document.createElement("div");
        footer.innerHTML = html;
        if (footer.firstElementChild) page.appendChild(footer.firstElementChild as HTMLElement);
      });

      // Wait for logo + fonts
      await (document as any).fonts?.ready;
      const imgs = Array.from(root.querySelectorAll("img"));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((res) => {
              if ((img as HTMLImageElement).complete) return res();
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
        ),
      );

      // Render each page to PDF
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWmm = doc.internal.pageSize.getWidth();
      const pageHmm = doc.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: PAGE_W,
        });
        const img = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) doc.addPage();
        doc.addImage(img, "JPEG", 0, 0, pageWmm, pageHmm, undefined, "FAST");
      }

      document.body.removeChild(root);

      const nome = (contrato.paciente?.nome ?? "contrato").replace(/[^a-zA-Z0-9_-]+/g, "_");
      const data = contrato.data_inicio ?? "";
      doc.save(`Contrato-${nome}-${data}.pdf`);
    } catch (err: any) {
      console.error("PDF generation error", err);
      toast.error(err?.message ?? "Erro ao gerar PDF");
    } finally {
      setGeneratingPdf(false);
    }
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
          <Button variant="outline" onClick={handleDownloadPdf} disabled={generatingPdf}>
            {generatingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {generatingPdf ? "Gerando..." : "Baixar PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setEstiloOpen(true)}
            className="border-amber-300 text-amber-800 hover:bg-amber-50"
          >
            <Palette className="mr-2 h-4 w-4" /> Estilo do PDF
          </Button>
          <Button onClick={handleWhatsapp} className="bg-green-600 text-white hover:bg-green-700">
            <MessageCircle className="mr-2 h-4 w-4" /> Enviar por WhatsApp
          </Button>
          {contrato.modalidade === "pacote_mensal" && contrato.status === "ativo" && (
            <Button
              variant="outline"
              onClick={handleGerarMensalidade}
              disabled={gerandoMensalidade}
              className="border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              {gerandoMensalidade ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              Gerar próxima mensalidade
            </Button>
          )}
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

    <DocumentoEstiloDialog open={estiloOpen} onOpenChange={setEstiloOpen} />
    </>
  );
}