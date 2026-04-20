"use client";

import { useState } from "react";
import { createVehicle, deleteVehicle } from "@/app/actions/vehicle";

export default function VehicleManager({ initialVehicles, clients }: { initialVehicles: any[], clients: any[] }) {
  const [vehicles] = useState(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ plate: "", brand: "", model: "", year: 2024, mileage: 0, vin: "", clientId: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createVehicle(formData);
    if (res.success) window.location.reload();
    else alert(res.error);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nuevo Vehículo</button>
      </div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Placa</th>
              <th style={{ padding: "1rem" }}>Marca/Modelo</th>
              <th style={{ padding: "1rem" }}>Propietario</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "1rem" }}>{v.plate}</td>
                <td style={{ padding: "1rem" }}>{v.brand} {v.model}</td>
                <td style={{ padding: "1rem" }}>{v.client.name}</td>
                <td style={{ padding: "1rem" }}>
                  <button onClick={async () => { if(confirm("¿Eliminar?")) await deleteVehicle(v.id); window.location.reload(); }} className="btn btn-secondary" style={{ color: "var(--danger)" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "450px", padding: "2rem" }}>
            <h2 className="h3">Nuevo Vehículo</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Placa</label>
                <input className="form-input" required onChange={e => setFormData({...formData, plate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select className="form-input" required onChange={e => setFormData({...formData, clientId: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
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
