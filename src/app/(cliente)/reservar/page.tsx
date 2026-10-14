"use client";

import { useState } from "react";
import Link from "next/link";
import { analyzeDiagnosticReport } from "@/app/actions/ai-diagnostic";
import { createClientBooking, ClientBookingInput } from "@/app/actions/client-booking";
import { DiagnosticReportResult } from "@/lib/ai/diagnostic";
import Swal from "sweetalert2";

export default function ReservarCitaPage() {
  // Estado del formulario
  const [tipoVehiculo, setTipoVehiculo] = useState<"CARRO" | "MOTO">("CARRO");
  const [clientData, setClientData] = useState({
    name: "",
    identification: "",
    phone: "",
    email: "",
  });
  const [vehicleData, setVehicleData] = useState({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
  });
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "09:00",
    symptoms: "",
  });

  // Estado del análisis IA
  const [analyzingIA, setAnalyzingIA] = useState(false);
  const [aiReport, setAiReport] = useState<DiagnosticReportResult | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Ejecutar pre-diagnóstico con IA
  const handleRunAIDiagnosis = async () => {
    if (!bookingData.symptoms.trim() || bookingData.symptoms.trim().length < 5) {
      Swal.fire({
        title: "Describe la falla",
        text: "Por favor escribe al menos 5 caracteres detallando el comportamiento o síntoma del vehículo.",
        icon: "info",
      });
      return;
    }

    setAnalyzingIA(true);
    try {
      const res = await analyzeDiagnosticReport({
        tipoVehiculo,
        marca: vehicleData.brand.trim() || (tipoVehiculo === "MOTO" ? "Motocicleta" : "Vehículo"),
        modelo: vehicleData.model.trim() || "Estándar",
        kilometraje: Number(vehicleData.mileage) || 0,
        sintomas_reportados: bookingData.symptoms,
      });

      if (res.success && res.data) {
        setAiReport(res.data);
        Swal.fire({
          title: "¡Pre-diagnóstico Generado!",
          text: `La IA ha clasificado la falla con prioridad ${res.data.nivel_prioridad}. Revisa la recomendación técnica a continuación.`,
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", res.error || "No se pudo realizar el análisis.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Ocurrió un problema de comunicación con el motor de IA.", "error");
    } finally {
      setAnalyzingIA(false);
    }
  };

  // Enviar el formulario y confirmar la cita
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.date || !bookingData.time) {
      Swal.fire("Fecha requerida", "Por favor selecciona el día y la hora para tu cita.", "warning");
      return;
    }

    setSubmittingBooking(true);
    try {
      const fullDateTime = `${bookingData.date}T${bookingData.time}:00`;

      // Si no ha ejecutado la IA previamente pero describió síntomas, generamos el análisis silenciosamente
      let finalAIReport = aiReport;
      if (!finalAIReport && bookingData.symptoms.trim().length >= 5) {
        const autoRes = await analyzeDiagnosticReport({
          tipoVehiculo,
          marca: vehicleData.brand.trim() || "General",
          modelo: vehicleData.model.trim() || "General",
          kilometraje: Number(vehicleData.mileage) || 0,
          sintomas_reportados: bookingData.symptoms,
        });
        if (autoRes.success && autoRes.data) {
          finalAIReport = autoRes.data;
        }
      }

      const payload: ClientBookingInput = {
        client: clientData,
        vehicle: {
          ...vehicleData,
          tipo: tipoVehiculo,
        },
        appointment: {
          date: fullDateTime,
          reason: bookingData.symptoms || "Revisión general preventiva",
          preDiagnosis: finalAIReport || undefined,
        },
      };

      const res = await createClientBooking(payload);

      if (res.success && res.data) {
        Swal.fire({
          title: "🎉 ¡Cita Agendada Exitosamente!",
          html: `
            <div style="text-align: left; font-size: 0.9rem; line-height: 1.6;">
              <p>Tu solicitud ha sido radicada con éxito en <strong>AutoPro</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #444; margin: 0.75rem 0;" />
              <p><strong>Cliente:</strong> ${clientData.name}</p>
              <p><strong>Vehículo:</strong> ${tipoVehiculo === "MOTO" ? "🏍️" : "🚗"} ${vehicleData.plate.toUpperCase()} (${vehicleData.brand} ${vehicleData.model})</p>
              <p><strong>Fecha programada:</strong> ${new Date(fullDateTime).toLocaleString()}</p>
              ${finalAIReport ? `<p style="color: #60a5fa;"><strong>Pre-diagnóstico IA:</strong> Registrado (Prioridad ${finalAIReport.nivel_prioridad})</p>` : ""}
              <p style="margin-top: 0.75rem; font-size: 0.8rem; color: #aaa;">Recibirás un mensaje de confirmación en tu teléfono.</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Entendido",
        }).then(() => {
          // Reset form
          setClientData({ name: "", identification: "", phone: "", email: "" });
          setVehicleData({ plate: "", brand: "", model: "", year: new Date().getFullYear(), mileage: 0 });
          setBookingData({ date: "", time: "09:00", symptoms: "" });
          setAiReport(null);
        });
      } else {
        Swal.fire("Error al agendar", res.error || "No fue posible crear la cita.", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", "Error inesperado al procesar la reserva.", "error");
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>⚙️</span>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>AutoPro</span>
          </div>
          <h1 className="h2" style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Portal de Citas y Diagnóstico Inteligente
          </h1>
          <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto" }}>
            Agenda la visita de tu vehículo a nuestro taller y obtén un pre-diagnóstico técnico preliminar generado por Inteligencia Artificial en tiempo real.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/" style={{ color: "var(--accent-primary)", fontSize: "0.875rem", textDecoration: "underline" }}>
              ¿Eres empleado del taller? Iniciar sesión aquí
            </Link>
          </div>
        </div>

        {/* Formulario de Reserva */}
        <form onSubmit={handleSubmitBooking} className="glass-panel" style={{ padding: "2.5rem" }}>
          {/* Paso 1: Tipo de Automotor */}
          <div style={{ marginBottom: "2rem" }}>
            <label className="form-label" style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              1. Selecciona el Tipo de Automotor
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button
                type="button"
                onClick={() => setTipoVehiculo("CARRO")}
                style={{
                  padding: "1.25rem",
                  borderRadius: "8px",
                  border: tipoVehiculo === "CARRO" ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)",
                  backgroundColor: tipoVehiculo === "CARRO" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: tipoVehiculo === "CARRO" ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "var(--transition)",
                }}
              >
                <span style={{ fontSize: "2rem" }}>🚗</span>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Automóvil / Camioneta</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoVehiculo("MOTO")}
                style={{
                  padding: "1.25rem",
                  borderRadius: "8px",
                  border: tipoVehiculo === "MOTO" ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)",
                  backgroundColor: tipoVehiculo === "MOTO" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: tipoVehiculo === "MOTO" ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "var(--transition)",
                }}
              >
                <span style={{ fontSize: "2rem" }}>🏍️</span>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Motocicleta</span>
              </button>
            </div>
          </div>

          {/* Paso 2: Datos del Propietario */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 className="h3" style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>👤</span> 2. Datos del Conductor / Propietario
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ej: Carlos Restrepo"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Identificación (Cédula o NIT) *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ej: 1144123456"
                  value={clientData.identification}
                  onChange={(e) => setClientData({ ...clientData, identification: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
              <div className="form-group">
                <label className="form-label">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder="Ej: 3151234567"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="carlos@correo.com"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Paso 3: Datos del Automotor */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 className="h3" style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚙️</span> 3. Datos del Automotor
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Placa *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={tipoVehiculo === "MOTO" ? "Ej: ABC12D" : "Ej: ABC123"}
                  value={vehicleData.plate}
                  onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Marca *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={tipoVehiculo === "MOTO" ? "Ej: Yamaha, Bajaj, KTM" : "Ej: Chevrolet, Renault, Mazda"}
                  value={vehicleData.brand}
                  onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo / Línea *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={tipoVehiculo === "MOTO" ? "Ej: NMax 155, Pulsar NS200" : "Ej: Spark GT, Duster, Mazda 3"}
                  value={vehicleData.model}
                  onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
              <div className="form-group">
                <label className="form-label">Año de Fabricación</label>
                <input
                  type="number"
                  className="form-input"
                  value={vehicleData.year}
                  onChange={(e) => setVehicleData({ ...vehicleData, year: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kilometraje Actual (km) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  placeholder="Ej: 35000"
                  value={vehicleData.mileage || ""}
                  onChange={(e) => setVehicleData({ ...vehicleData, mileage: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Paso 4: Cita y Diagnóstico con IA */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h3 className="h3" style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📅</span> 4. Agenda y Reporte de Síntomas
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Fecha Deseada *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hora Deseada *</label>
                <input
                  type="time"
                  className="form-input"
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Describe la falla o síntomas de tu {tipoVehiculo === "MOTO" ? "moto" : "carro"} *
              </label>
              <textarea
                className="form-input"
                rows={3}
                required
                placeholder={
                  tipoVehiculo === "MOTO"
                    ? "Ej: Al acelerar a fondo la moto pierde fuerza y se ahoga. También escucho un golpeteo metálico en la cadena..."
                    : "Ej: Al pisar el freno vibra el pedal y el carro se va ligeramente hacia la derecha. Además se encendió el testigo de check engine..."
                }
                value={bookingData.symptoms}
                onChange={(e) => setBookingData({ ...bookingData, symptoms: e.target.value })}
              />
            </div>

            {/* Botón interactivo de Pre-diagnóstico */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRunAIDiagnosis}
                disabled={analyzingIA}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderColor: "rgba(59, 130, 246, 0.5)",
                  color: "#60a5fa",
                }}
              >
                {analyzingIA ? (
                  <>
                    <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid #60a5fa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                    Consultando IA...
                  </>
                ) : (
                  <>
                    <span>✨</span> Obtener Pre-diagnóstico con IA
                  </>
                )}
              </button>
            </div>

            {/* Panel de Pre-diagnóstico IA Resultante */}
            {aiReport && (
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "1.5rem",
                  backgroundColor: "rgba(15, 23, 42, 0.7)",
                  borderRadius: "8px",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>🤖</span> Pre-diagnóstico Asistido por Inteligencia Artificial
                  </h4>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor:
                        aiReport.nivel_prioridad === "ALTA"
                          ? "var(--danger)"
                          : aiReport.nivel_prioridad === "MEDIA"
                          ? "#f59e0b"
                          : "var(--success)",
                      color: "#fff",
                    }}
                  >
                    PRIORIDAD {aiReport.nivel_prioridad}
                  </span>
                </div>

                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text-primary)", marginBottom: "1rem" }}>
                  {aiReport.diagnostico_preliminar}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Sistemas que inspeccionará el taller:
                    </span>
                    <ul style={{ margin: "0.35rem 0 0 1.25rem", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {aiReport.sistemas_a_inspeccionar.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Repuestos comúnmente requeridos:
                    </span>
                    <ul style={{ margin: "0.35rem 0 0 1.25rem", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {aiReport.repuestos_sugeridos.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón Final de Envío */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submittingBooking}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {submittingBooking ? (
              <>
                <span className="spinner" style={{ width: "20px", height: "20px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                Procesando Agendamiento...
              </>
            ) : (
              <>
                <span>📅</span> Confirmar y Agendar Cita en AutoPro
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
