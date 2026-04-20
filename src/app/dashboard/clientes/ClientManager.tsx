"use client";

import { useState } from "react";
import { createClient, deleteClient } from "@/app/actions/client";

export default function ClientManager({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", identification: "", phone: "", email: "", address: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createClient(formData);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar cliente?")) return;
    const res = await deleteClient(id);
    if (res.success) window.location.reload();
    else alert(res.error);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nuevo Cliente</button>
      </div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Nombre</th>
              <th style={{ padding: "1rem" }}>Identificación</th>
              <th style={{ padding: "1rem" }}>Teléfono</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "1rem" }}>{c.name}</td>
                <td style={{ padding: "1rem" }}>{c.identification}</td>
                <td style={{ padding: "1rem" }}>{c.phone}</td>
                <td style={{ padding: "1rem" }}>
                  <button onClick={() => handleDelete(c.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "400px", padding: "2rem" }}>
            <h2 className="h3">Nuevo Cliente</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" required onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Identificación</label>
                <input className="form-input" required onChange={e => setFormData({...formData, identification: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="form-input" required onChange={e => setFormData({...formData, phone: e.target.value})} />
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
