"use client";

import { useState } from "react";
import { createOrder } from "@/controllers/OrdenController";
import Link from "next/link";
import Swal from "sweetalert2";

export default function OrdenesView({ initialOrders, clients, vehicles, mechanics }: { initialOrders: any[], clients: any[], vehicles: any[], mechanics: any[] }) {
  const [orders] = useState(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientId: "", vehicleId: "", mechanicId: "", fuelLevel: "1/4" });

  const availableVehicles = vehicles.filter((v: any) => v.clientId === formData.clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createOrder(formData);
    if (res.success) {
      setIsModalOpen(false);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Orden creada exitosamente',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: res.error || "Error al crear orden",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Órdenes de Servicio</h1>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nueva Orden</button>
        </div>
        <div className="glass-panel" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "1rem" }}>Fecha</th>
                <th style={{ padding: "1rem" }}>Cliente/Vehículo</th>
                <th style={{ padding: "1rem" }}>Estado</th>
                <th style={{ padding: "1rem" }}>Total</th>
                <th style={{ padding: "1rem" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1rem" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem" }}>
                    <div>{order.client.name}</div>
                    <div className="text-sm text-muted">{order.vehicle.plate}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>{order.status}</td>
                  <td style={{ padding: "1rem" }}>${order.totalCost.toLocaleString()}</td>
                  <td style={{ padding: "1rem" }}>
                    <Link href={`/dashboard/ordenes/${order.id}`} className="btn btn-secondary">Detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="glass-panel" style={{ width: "450px", padding: "2rem" }}>
              <h2 className="h3">Nueva Orden</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select className="form-input" required onChange={e => setFormData({...formData, clientId: e.target.value, vehicleId: ""})}>
                    <option value="">Seleccione...</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vehículo</label>
                  <select className="form-input" required disabled={!formData.clientId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {availableVehicles.map((v: any) => <option key={v.id} value={v.id}>{v.plate} - {v.brand}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
