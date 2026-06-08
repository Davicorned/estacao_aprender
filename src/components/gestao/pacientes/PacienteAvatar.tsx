import { iniciais } from "@/lib/pacientes";

export function PacienteAvatar({
  nome,
  fotoUrl,
  size = 40,
}: {
  nome: string;
  fotoUrl?: string | null;
  size?: number;
}) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#FEF3E8] font-semibold text-[#D67F43]"
      style={{ width: size, height: size, fontSize: Math.max(12, size / 2.8) }}
    >
      {iniciais(nome) || "?"}
    </div>
  );
}