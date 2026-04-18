"use client";

import { useState } from "react";
import { createAppointment, updateAppointmentStatus } from "@/app/actions/appointment";

export default function AppointmentManager({ initialAppointments, clients, vehicles, mechanics }: { initialAppointments: any[], clients: any[], vehicles: any[], mechanics: any[] }) {
  const [appointments] = useState(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: "", time: "", clientId: "", vehicleId: "", mechanicId: "" });

  const availableVehicles = vehicles.filter(v => v.clientId === formData.clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    const res = await createAppointment({ date: dateTime, clientId: formData.clientId, vehicleId: formData.vehicleId, mechanicId: formData.mechanicId });
    if (res.success) window.location.reload();
    else alert(res.error);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nueva Cita</button>
      </div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Fecha/Hora</th>
              <th style={{ padding: "1rem" }}>Cliente</th>
              <th style={{ padding: "1rem" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id}>
                <td style={{ padding: "1rem" }}>{new Date(app.date).toLocaleString()}</td>
                <td style={{ padding: "1rem" }}>{app.client.name}</td>
                <td style={{ padding: "1rem" }}>{app.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "450px", padding: "2rem" }}>
            <h2 className="h3">Programar Cita</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input type="date" className="form-input" required onChange={e => setFormData({...formData, date: e.target.value})} />
                <input type="time" className="form-input" required onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <select className="form-input" style={{ marginTop: "1rem" }} required onChange={e => setFormData({...formData, clientId: e.target.value, vehicleId: ""})}>
                <option value="">Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="form-input" style={{ marginTop: "1rem" }} disabled={!formData.clientId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                <option value="">Vehículo...</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
              </select>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Programar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
