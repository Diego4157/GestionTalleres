"use client";

import { useState } from "react";
import { analyzeDiagnosticReport, saveAIDiagnosisToOrder } from "@/app/actions/ai-diagnostic";
import { DiagnosticReportResult } from "@/lib/ai/diagnostic";
import Swal from "sweetalert2";

interface DiagnosticAIAssistantProps {
  orderId: string;
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    mileage: number;
    tipo?: "CARRO" | "MOTO";
  };
  inventory: any[];
  currentDiagnosis: string;
  onDiagnosisUpdated: (newDiagnosis: string) => void;
  onSelectPartToAdd?: (partId: string) => void;
  preDiagnosisInitial?: any;
}

export default function DiagnosticAIAssistant({
  orderId,
  vehicle,
  inventory,
  currentDiagnosis,
  onDiagnosisUpdated,
  onSelectPartToAdd,
  preDiagnosisInitial,
}: DiagnosticAIAssistantProps) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReportResult | null>(preDiagnosisInitial || null);
  const [savingToOrder, setSavingToOrder] = useState(false);

  const isMoto = (vehicle?.tipo || "CARRO") === "MOTO";

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      Swal.fire({
        title: "Síntomas requeridos",
        text: "Por favor describe las fallas o síntomas que presenta el automotor para que la IA realice el análisis.",
        icon: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await analyzeDiagnosticReport({
        tipoVehiculo: isMoto ? "MOTO" : "CARRO",
        marca: vehicle?.brand || "Desconocida",
        modelo: vehicle?.model || "Desconocido",
        kilometraje: vehicle?.mileage || 0,
        sintomas_reportados: symptoms,
      });

      if (res.success && res.data) {
        setReport(res.data);
      } else {
        Swal.fire("Error en Análisis", res.error || "No se pudo generar el diagnóstico.", "error");
      }
    } catch (err: any) {
      Swal.fire("Error Inesperado", "Ocurrió un fallo en la conexión con el motor de IA.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToOrder = async () => {
    if (!report) return;
    setSavingToOrder(true);

    const sistemasTexto = report.sistemas_a_inspeccionar.map((s) => `• ${s}`).join("\n");
    const repuestosTexto = report.repuestos_sugeridos.map((r) => `• ${r}`).join("\n");
    const bloqueIA = `[DIAGNÓSTICO ASISTIDO IA (${report.origen_motor || "IA"}) - Prioridad: ${report.nivel_prioridad}]\n${report.diagnostico_preliminar}\n\nSistemas sugeridos a inspeccionar:\n${sistemasTexto}\n\nRepuestos estimados:\n${repuestosTexto}`;

    const nuevoDiagnostico = currentDiagnosis.trim()
      ? `${currentDiagnosis}\n\n${bloqueIA}`
      : bloqueIA;

    const res = await saveAIDiagnosisToOrder(orderId, report, true);
    if (res.success) {
      onDiagnosisUpdated(nuevoDiagnostico);
      Swal.fire({
        title: "¡Diagnóstico Vinculado!",
        text: "El análisis técnico de la IA y sistemas a inspeccionar han sido agregados a los detalles de la orden.",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Error", res.error || "No se pudo actualizar la orden.", "error");
    }
    setSavingToOrder(false);
  };

  // Buscar coincidencia en inventario para cada repuesto sugerido
  const findMatchingInventoryItem = (sugerido: string) => {
    const palabras = sugerido.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return inventory.find(inv => {
      const desc = inv.description.toLowerCase();
      return palabras.some(p => desc.includes(p));
    });
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: "1.75rem",
        marginBottom: "2rem",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🤖</span>
            <h3 className="h3" style={{ margin: 0, color: "var(--text-primary)" }}>
              Diagnóstico Inteligente Asistido por IA (Gemini Flash)
            </h3>
          </div>
          <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Análisis motor para {isMoto ? "🏍️ Motocicleta" : "🚗 Automóvil"} • {vehicle?.brand} {vehicle?.model} ({vehicle?.mileage?.toLocaleString() || 0} km)
          </p>
        </div>

        {report && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                backgroundColor:
                  report.nivel_prioridad === "ALTA"
                    ? "var(--danger)"
                    : report.nivel_prioridad === "MEDIA"
                    ? "#f59e0b"
                    : "var(--success)",
                color: "#ffffff",
                letterSpacing: "0.05em",
              }}
            >
              PRIORIDAD {report.nivel_prioridad}
            </span>
            <span
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.7rem",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                color: "#60a5fa",
              }}
            >
              {report.origen_motor === "GEMINI_FLASH" ? "⚡ Google Gemini Flash" : "🛡️ Fallback Offline"}
            </span>
          </div>
        )}
      </div>

      {/* Entrada de Síntomas */}
      <div style={{ marginBottom: "1.25rem" }}>
        <label className="form-label" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          Describe los síntomas observados o reportados por el conductor:
        </label>
        <textarea
          className="form-input"
          rows={3}
          placeholder={
            isMoto
              ? "Ej: Tirones al acelerar en segunda marcha, ruido metálico en la parte trasera y dificultad para arrancar en frío..."
              : "Ej: Pedal de freno esponjoso con testigo de ABS intermitente y vibración en la dirección a más de 80 km/h..."
          }
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                Analizando con Gemini Flash...
              </>
            ) : (
              <>
                <span>✨</span> Ejecutar Diagnóstico Asistido
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultados Estructurados del Diagnóstico */}
      {report && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.25rem",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#60a5fa", marginBottom: "0.35rem" }}>
              📋 Diagnóstico Técnico Preliminar
            </h4>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
              {report.diagnostico_preliminar}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1rem" }}>
            {/* Sistemas a Inspeccionar */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                🔍 Sistemas Sugeridos a Inspeccionar:
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {report.sistemas_a_inspeccionar.map((sistema, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.45rem 0.75rem",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "6px",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ color: "var(--accent-primary)" }}>✓</span>
                    {sistema}
                  </div>
                ))}
              </div>
            </div>

            {/* Repuestos Sugeridos y Match con Inventario */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                🔩 Repuestos Estimados por IA:
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {report.repuestos_sugeridos.map((repuesto, i) => {
                  const match = findMatchingInventoryItem(repuesto);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "6px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{repuesto}</span>
                        {match && onSelectPartToAdd && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
                            onClick={() => onSelectPartToAdd(match.id)}
                            title={`Stock en taller: ${match.currentStock} - $${match.salePrice.toLocaleString()}`}
                          >
                            + Cargar ({match.code})
                          </button>
                        )}
                      </div>
                      {match && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          Coincidencia en taller: <strong>{match.description}</strong> (Stock: {match.currentStock})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botón para integrar diagnóstico a la orden */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleApplyToOrder}
              disabled={savingToOrder}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa", borderColor: "rgba(59, 130, 246, 0.4)" }}
            >
              <span>📥</span> {savingToOrder ? "Guardando..." : "Cargar Diagnóstico y Sistemas a la Orden"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
