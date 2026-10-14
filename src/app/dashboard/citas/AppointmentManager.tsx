"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAppointment, updateAppointment, deleteAppointment, createOrderFromAppointment } from "@/app/actions/appointment";
import Swal from "sweetalert2";

export default function AppointmentManager({
  initialAppointments,
  clients,
  vehicles,
  mechanics,
}: {
  initialAppointments: any[];
  clients: any[];
  vehicles: any[];
  mechanics: any[];
}) {
  const [appointments] = useState(initialAppointments);
  const router = useRouter();

  const handleCreateOrder = async (app: any) => {
    const confirmation = await Swal.fire({
      title: "¿Crear orden de trabajo?",
      text: "Se creará una orden vinculada con los datos de la cita y el pre-diagnóstico IA. La cita se marcará como completada.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear orden",
      cancelButtonText: "Cancelar",
    });
    if (!confirmation.isConfirmed) return;

    const res = await createOrderFromAppointment(app.id);
    if (res.success && res.data) {
      await Swal.fire({
        title: "¡Orden creada!",
        text: "Te llevaremos al detalle para registrar la recepción del vehículo.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push(`/dashboard/ordenes/${res.data.id}`);
    } else {
      Swal.fire("Error", res.error || "No se pudo crear la orden.", "error");
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    clientId: "",
    vehicleId: "",
    mechanicId: "",
    reason: "",
  });

  const availableVehicles = vehicles.filter((v) => v.clientId === formData.clientId);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ date: "", time: "", clientId: "", vehicleId: "", mechanicId: "", reason: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (app: any) => {
    setEditingId(app.id);
    const d = new Date(app.date);
    setFormData({
      date: d.toISOString().split("T")[0],
      time: d.toTimeString().split(":")[0] + ":" + d.toTimeString().split(":")[1],
      clientId: app.clientId,
      vehicleId: app.vehicleId || "",
      mechanicId: app.mechanicId || "",
      reason: app.reason || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta cita?")) return;
    const res = await deleteAppointment(id);
    if (res.success) {
      Swal.fire("¡Eliminada!", "La cita fue eliminada", "success").then(() => window.location.reload());
    } else {
      Swal.fire("Error", res.error, "error");
    }
  };

  const handleShowAIDiagnosis = (app: any) => {
    const diag = app.preDiagnosis;
    if (!diag) {
      Swal.fire("Sin diagnóstico IA", "Esta cita no cuenta con un pre-diagnóstico de IA registrado.", "info");
      return;
    }

    const sistemasHtml = (diag.sistemas_a_inspeccionar || []).map((s: string) => `<li>${s}</li>`).join("");
    const repuestosHtml = (diag.repuestos_sugeridos || []).map((r: string) => `<li>${r}</li>`).join("");

    Swal.fire({
      title: "🤖 Pre-diagnóstico Asistido por IA",
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <strong>Prioridad:</strong>
            <span style="padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 0.75rem; color: #fff; background-color: ${
              diag.nivel_prioridad === "ALTA" ? "#ef4444" : diag.nivel_prioridad === "MEDIA" ? "#f59e0b" : "#10b981"
            }">
              ${diag.nivel_prioridad}
            </span>
          </div>
          <p><strong>Diagnóstico Preliminar:</strong></p>
          <p style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">${diag.diagnostico_preliminar}</p>
          <div style="margin-top: 0.75rem;">
            <strong>Sistemas sugeridos a inspeccionar:</strong>
            <ul style="margin: 4px 0 0 16px;">${sistemasHtml}</ul>
          </div>
          <div style="margin-top: 0.75rem;">
            <strong>Repuestos estimados:</strong>
            <ul style="margin: 4px 0 0 16px;">${repuestosHtml}</ul>
          </div>
        </div>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    const payload = {
      date: dateTime,
      clientId: formData.clientId,
      vehicleId: formData.vehicleId,
      mechanicId: formData.mechanicId,
      reason: formData.reason,
    };
    const res = editingId
      ? await updateAppointment(editingId, payload)
      : await createAppointment(payload);

    if (res.success) {
      setIsModalOpen(false);
      Swal.fire({
        title: "¡Éxito!",
        text: editingId ? "Cita actualizada exitosamente" : "Cita programada exitosamente",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        title: "Error",
        text: res.error || "Error al procesar cita",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Nueva Cita</button>
      </div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Fecha / Hora</th>
              <th style={{ padding: "1rem" }}>Cliente</th>
              <th style={{ padding: "1rem" }}>Vehículo</th>
              <th style={{ padding: "1rem" }}>Motivo / Falla</th>
              <th style={{ padding: "1rem" }}>Pre-diagnóstico IA</th>
              <th style={{ padding: "1rem" }}>Estado</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app) => {
              const diag = app.preDiagnosis;
              const isMoto = app.vehicle?.tipo === "MOTO";

              return (
                <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1rem" }}>{new Date(app.date).toLocaleString()}</td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 600 }}>{app.client?.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>{app.client?.phone}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {app.vehicle ? (
                      <div>
                        <span>{isMoto ? "🏍️ " : "🚗 "}</span>
                        <strong>{app.vehicle.plate}</strong>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {app.vehicle.brand} {app.vehicle.model}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">No asignado</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", maxWidth: "220px" }}>
                    <span style={{ fontSize: "0.85rem" }}>{app.reason || "Revisión general"}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {diag ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            backgroundColor:
                              diag.nivel_prioridad === "ALTA"
                                ? "var(--danger)"
                                : diag.nivel_prioridad === "MEDIA"
                                ? "#f59e0b"
                                : "var(--success)",
                            color: "#fff",
                          }}
                        >
                          {diag.nivel_prioridad}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          onClick={() => handleShowAIDiagnosis(app)}
                        >
                          🔍 Ver IA
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: "0.8rem" }}>Sin IA</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: app.status === "CONFIRMADA" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)",
                      color: app.status === "CONFIRMADA" ? "#10b981" : "var(--text-secondary)"
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {app.vehicleId && app.status !== "COMPLETADA" && app.status !== "CANCELADA" && (
                        <button onClick={() => handleCreateOrder(app)} className="btn btn-primary">Crear Orden de Trabajo</button>
                      )}
                      <button onClick={() => openEditModal(app)} className="btn btn-secondary">Editar</button>
                      <button onClick={() => handleDelete(app.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "450px", padding: "2rem" }}>
            <h2 className="h3">{editingId ? "Editar Cita" : "Programar Cita"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input type="date" className="form-input" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                <input type="time" className="form-input" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <select className="form-input" style={{ marginTop: "1rem" }} required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value, vehicleId: "" })}>
                <option value="">Cliente...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="form-input" style={{ marginTop: "1rem" }} disabled={!formData.clientId} value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}>
                <option value="">Vehículo...</option>
                {availableVehicles.map((v) => <option key={v.id} value={v.id}>{v.plate} ({v.brand} {v.model})</option>)}
              </select>
              <select className="form-input" style={{ marginTop: "1rem" }} value={formData.mechanicId} onChange={(e) => setFormData({ ...formData, mechanicId: e.target.value })}>
                <option value="">Mecánico asignado (Opcional)...</option>
                {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div style={{ marginTop: "1rem" }}>
                <label className="form-label">Motivo o falla reportada</label>
                <textarea className="form-input" rows={2} placeholder="Descripción del motivo de la cita..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
