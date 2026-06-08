import { Printer, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { whatsappLink, type ContratoComJoin } from "@/lib/contratos";

type Props = {
  contrato: ContratoComJoin;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function ContratoView({ contrato, open, onOpenChange }: Props) {
  function handlePrint() {
    window.print();
  }

  function handleWhatsapp() {
    const tel = contrato.paciente?.telefone_celular ?? "";
    const msg = `Olá! Segue o contrato de prestação de serviços da Estação Aprender para ${contrato.paciente?.nome ?? "você"}. Qualquer dúvida estamos à disposição.`;
    window.open(whatsappLink(tel, msg), "_blank");
  }

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
          <Button onClick={handleWhatsapp} className="bg-green-600 text-white hover:bg-green-700">
            <MessageCircle className="mr-2 h-4 w-4" /> Enviar por WhatsApp
          </Button>
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