export const MIN_SYMPTOMS_LENGTH = 5;
export const MAX_SYMPTOMS_LENGTH = 800;
export const MAX_SHORT_TEXT_LENGTH = 60;
export const MAX_MILEAGE = 2_000_000;

/** Elimina caracteres de control, normaliza espacios y recorta al máximo permitido. */
export function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, max);
}

export function sanitizeMileage(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), MAX_MILEAGE);
}
