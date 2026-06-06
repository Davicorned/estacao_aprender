import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { FadeUp } from "@/components/site/FadeUp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLANOS = [
  "Amil",
  "Bradesco Saúde",
  "SulAmérica",
  "Unimed",
  "Porto Seguro",
  "NotreDame Intermédica",
  "Hapvida",
  "Outro",
];

const HORARIOS = ["Manhã", "Tarde", "Noite"];

type FormState = {
  nome: string;
  whatsapp: string;
  email: string;
  plano: string;
  cidade_bairro: string;
  horario: string;
  observacoes: string;
  consentimento: boolean;
};

const INITIAL: FormState = {
  nome: "",
  whatsapp: "",
  email: "",
  plano: "",
  cidade_bairro: "",
  horario: "",
  observacoes: "",
  consentimento: false,
};

export function ConvenioForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL);
  const navigate = useNavigate();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Olá! Gostaria de solicitar atendimento via convênio.\n\n` +
        `Nome: ${formData.nome}\n` +
        `WhatsApp: ${formData.whatsapp}\n` +
        `E-mail: ${formData.email}\n` +
        `Plano: ${formData.plano}\n` +
        `Cidade/Bairro: ${formData.cidade_bairro}\n` +
        `Melhor horário: ${formData.horario}\n` +
        `Observações: ${formData.observacoes}`,
    );
    window.open(`https://wa.me/5511966654857?text=${msg}`, "_blank");
    navigate({ to: "/ConvenioObrigado" });
  };

  return (
    <FadeUp delay={0.1}>
      <div className="rounded-xl border-0 bg-white p-8 shadow-2xl shadow-gray-200/50">
        <span className="mb-3 inline-flex rounded-md bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 shadow">
          Formulário de solicitação
        </span>
        <h2 className="text-2xl font-bold text-gray-900">Solicite atendimento via convênio</h2>
        <p className="mt-1 text-sm text-gray-600">
          Preencha os dados abaixo e entraremos em contato.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Seu nome"
              className="h-11"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              required
              value={formData.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-11"
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="seu@email.com"
              className="h-11"
            />
          </div>

          <div>
            <Label>Plano de Saúde *</Label>
            <Select
              required
              value={formData.plano}
              onValueChange={(v) => update("plano", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione seu plano" />
              </SelectTrigger>
              <SelectContent>
                {PLANOS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cidade_bairro">Cidade/Bairro</Label>
            <Input
              id="cidade_bairro"
              value={formData.cidade_bairro}
              onChange={(e) => update("cidade_bairro", e.target.value)}
              placeholder="Ex: São Paulo - Moema"
              className="h-11"
            />
          </div>

          <div>
            <Label>Melhor horário para contato</Label>
            <Select
              value={formData.horario}
              onValueChange={(v) => update("horario", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {HORARIOS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={3}
              value={formData.observacoes}
              onChange={(e) => update("observacoes", e.target.value)}
              placeholder="Alguma informação adicional?"
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="consentimento"
              checked={formData.consentimento}
              onCheckedChange={(v) => update("consentimento", v === true)}
              required
            />
            <Label
              htmlFor="consentimento"
              className="cursor-pointer text-sm leading-tight text-gray-600"
            >
              Concordo em ser contatado(a) para receber informações sobre o atendimento via
              convênio (LGPD) *
            </Label>
          </div>

          <button
            id="negativar"
            type="submit"
            disabled={!formData.consentimento}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-medium text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="mr-2 h-4 w-4" />
            Solicitar análise do convênio
          </button>
        </form>
      </div>
    </FadeUp>
  );
}