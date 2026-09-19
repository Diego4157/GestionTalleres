"use client";

import { useState } from "react";
import { createVehicle, deleteVehicle, updateVehicle } from "@/controllers/VehicleController";
import Swal from "sweetalert2";

export default function VehiculosView({ initialVehicles, clients }: { initialVehicles: any[], clients: any[] }) {
  const [vehicles] = useState(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ plate: "", brand: "", model: "", year: 2024, mileage: 0, vin: "", clientId: "" });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ plate: "", brand: "", model: "", year: 2024, mileage: 0, vin: "", clientId: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingId(vehicle.id);
    setFormData({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      vin: vehicle.vin || "",
      clientId: vehicle.clientId
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      year: Number(formData.year),
      mileage: Number(formData.mileage)
    };
    const res = editingId 
      ? await updateVehicle(editingId, payload)
      : await createVehicle(payload);
      
    if (res.success) {
      setIsModalOpen(false);
      Swal.fire({
        title: '¡Éxito!',
        text: editingId ? 'Vehículo actualizado exitosamente' : 'Vehículo registrado exitosamente',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: res.error || "Error al procesar la solicitud",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Gestión de Vehículos</h1>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button className="btn btn-primary" onClick={openCreateModal}>+ Nuevo Vehículo</button>
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
                  <td style={{ padding: "1rem" }}>{v.client?.name}</td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => openEditModal(v)} className="btn btn-secondary">Editar</button>
                      <button onClick={async () => { 
                        if (confirm("¿Eliminar?")) {
                          const res = await deleteVehicle(v.id);
                          if (res.success) {
                            Swal.fire({
                              title: '¡Eliminado!',
                              text: 'Vehículo eliminado correctamente',
                              icon: 'success',
                              confirmButtonText: 'OK'
                            }).then(() => {
                              window.location.reload();
                            });
                          } else {
                            Swal.fire({
                              title: 'Error',
                              text: res.error || "Error al eliminar",
                              icon: 'error',
                              confirmButtonText: 'OK'
                            });
                          }
                        }
                      }} className="btn btn-secondary" style={{ color: "var(--danger)" }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="glass-panel" style={{ width: "450px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
              <h2 className="h3">{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Placa</label>
                  <input className="form-input" required value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Marca</label>
                  <input className="form-input" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Modelo</label>
                  <input className="form-input" required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input type="number" className="form-input" required value={formData.year} onChange={e => setFormData({ ...formData, year: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kilometraje</label>
                  <input type="number" className="form-input" required value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">VIN (Opcional)</label>
                  <input className="form-input" value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select className="form-input" required value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                    <option value="">Seleccione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
