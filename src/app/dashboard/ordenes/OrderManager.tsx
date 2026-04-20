"use client";

import { useState } from "react";
import { createOrder } from "@/app/actions/order";
import Link from "next/link";

export default function OrderManager({ initialOrders, clients, vehicles, mechanics }: { initialOrders: any[], clients: any[], vehicles: any[], mechanics: any[] }) {
  const [orders] = useState(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientId: "", vehicleId: "", mechanicId: "", fuelLevel: "1/4" });

  const availableVehicles = vehicles.filter(v => v.clientId === formData.clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createOrder(formData);
    if (res.success) window.location.reload();
    else alert(res.error);
  };

  return (
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
            {orders.map(order => (
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
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vehículo</label>
                <select className="form-input" required disabled={!formData.clientId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.brand}</option>)}
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
  );
}
