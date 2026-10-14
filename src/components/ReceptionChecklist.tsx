"use client";

import { FUEL_LEVELS, ReceptionChecklistValue } from "@/lib/reception";

interface ReceptionChecklistProps {
  fuelLevel: string;
  checklist: ReceptionChecklistValue;
  tipo?: "CARRO" | "MOTO";
  disabled?: boolean;
  onFuelChange: (value: string) => void;
  onChecklistChange: (value: ReceptionChecklistValue) => void;
}

export default function ReceptionChecklist({
  fuelLevel,
  checklist,
  tipo = "CARRO",
  disabled = false,
  onFuelChange,
  onChecklistChange,
}: ReceptionChecklistProps) {
  const items: { key: "rayones" | "herramientas" | "ruedaRepuesto"; label: string }[] = [
    { key: "rayones", label: "Presenta rayones / golpes visibles" },
    { key: "herramientas", label: "Entrega kit de herramientas" },
  ];
  if (tipo === "CARRO") {
    items.push({ key: "ruedaRepuesto", label: "Entrega rueda de repuesto" });
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Nivel de gasolina</label>
        <select
          className="form-input"
          value={fuelLevel}
          disabled={disabled}
          onChange={(e) => onFuelChange(e.target.value)}
        >
          {FUEL_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Checklist de recepción</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.map((item) => (
            <label key={item.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: disabled ? "default" : "pointer" }}>
              <input
                type="checkbox"
                checked={checklist[item.key]}
                disabled={disabled}
                onChange={(e) => onChecklistChange({ ...checklist, [item.key]: e.target.checked })}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Observaciones de recepción</label>
        <textarea
          className="form-input"
          rows={2}
          disabled={disabled}
          placeholder="Ej: rayón en puerta derecha, espejo izquierdo flojo..."
          value={checklist.observaciones}
          onChange={(e) => onChecklistChange({ ...checklist, observaciones: e.target.value })}
        />
      </div>
    </div>
  );
}
