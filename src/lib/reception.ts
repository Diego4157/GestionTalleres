export interface ReceptionChecklistValue {
  rayones: boolean;
  herramientas: boolean;
  ruedaRepuesto: boolean;
  observaciones: string;
  fotos?: string[];
}

export const FUEL_LEVELS = ["Reserva", "1/4", "1/2", "3/4", "Lleno"] as const;

export const EMPTY_CHECKLIST: ReceptionChecklistValue = {
  rayones: false,
  herramientas: false,
  ruedaRepuesto: false,
  observaciones: "",
  fotos: [],
};

/** Normaliza el JSON persistido en Order.checklist a un valor tipado. */
export function parseChecklist(raw: unknown): ReceptionChecklistValue {
  if (!raw || typeof raw !== "object") return { ...EMPTY_CHECKLIST };
  const r = raw as Partial<ReceptionChecklistValue>;
  return {
    rayones: Boolean(r.rayones),
    herramientas: Boolean(r.herramientas),
    ruedaRepuesto: Boolean(r.ruedaRepuesto),
    observaciones: typeof r.observaciones === "string" ? r.observaciones : "",
    fotos: Array.isArray(r.fotos) ? r.fotos.filter((f): f is string => typeof f === "string") : [],
  };
}
