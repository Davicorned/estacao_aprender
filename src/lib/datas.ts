// Helpers de data amarrados ao fuso local do Brasil.
// Evita bugs em que "hoje/agora" à noite vira UTC+1 dia.
const TZ = "America/Sao_Paulo";

export function hojeLocal(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

export function toLocalISODate(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}