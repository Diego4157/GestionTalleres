"use client";

import { useState } from "react";
import { FUEL_LEVELS, ReceptionChecklistValue } from "@/lib/reception";

interface ReceptionChecklistProps {
  fuelLevel: string;
  checklist: ReceptionChecklistValue;
  tipo?: "CARRO" | "MOTO";
  disabled?: boolean;
  onFuelChange: (value: string) => void;
  onChecklistChange: (value: ReceptionChecklistValue) => void;
}

function compressImage(file: File, maxDim = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReceptionChecklist({
  fuelLevel,
  checklist,
  tipo = "CARRO",
  disabled = false,
  onFuelChange,
  onChecklistChange,
}: ReceptionChecklistProps) {
  const [compressing, setCompressing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fotos = checklist.fotos || [];

  const items: { key: "rayones" | "herramientas" | "ruedaRepuesto"; label: string }[] = [
    { key: "rayones", label: "Presenta rayones / golpes visibles" },
    { key: "herramientas", label: "Entrega kit de herramientas" },
  ];
  if (tipo === "CARRO") {
    items.push({ key: "ruedaRepuesto", label: "Entrega rueda de repuesto" });
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    try {
      const newFotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (fotos.length + newFotos.length >= 8) break;
        const compressed = await compressImage(files[i]);
        newFotos.push(compressed);
      }
      onChecklistChange({
        ...checklist,
        fotos: [...fotos, ...newFotos],
      });
    } catch (err) {
      console.error("Error al procesar imágenes:", err);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = fotos.filter((_, i) => i !== index);
    onChecklistChange({ ...checklist, fotos: updated });
  };

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
          placeholder="Ej: rayón en puerta derecha, espejo izquierdo flojo, baúl cargado..."
          value={checklist.observaciones}
          onChange={(e) => onChecklistChange({ ...checklist, observaciones: e.target.value })}
        />
      </div>

      {/* Evidencia fotográfica de recepción */}
      <div className="form-group" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
            📸 Fotos de evidencia ({fotos.length}/8)
          </label>
          {fotos.length > 0 && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Toca para ampliar
            </span>
          )}
        </div>

        {/* Galería de fotos */}
        {fotos.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}>
            {fotos.map((imgSrc, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                {/* Imagen */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt={`Evidencia ${idx + 1}`}
                  onClick={() => setPreviewPhoto(imgSrc)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                    display: "block",
                  }}
                />

                {/* Botón eliminar */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(idx);
                    }}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón para subir fotos */}
        {!disabled && fotos.length < 8 && (
          <div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                border: "1px dashed var(--accent-primary)",
                color: "var(--text-primary)",
                cursor: compressing ? "wait" : "pointer",
                fontSize: "0.875rem",
                width: "100%",
                justifyContent: "center",
                transition: "var(--transition)",
              }}
            >
              <span>{compressing ? "⏳ Procesando..." : "📷 Tomar o subir fotos del vehículo"}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                disabled={compressing}
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", textAlign: "center" }}>
              Toma fotos con la cámara del celular de rayones, golpes, odómetro o estado general.
            </p>
          </div>
        )}
      </div>

      {/* Modal Lightbox para ampliar la foto */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto}
              alt="Evidencia ampliada"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                objectFit: "contain",
              }}
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--danger)",
                color: "white",
                border: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
