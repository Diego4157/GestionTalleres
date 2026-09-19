"use client";

import { useState } from "react";
import { createClient, deleteClient, updateClient } from "@/controllers/ClienteController";
import Swal from "sweetalert2";

export default function ClientesView({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", identification: "", phone: "", email: "", address: "" });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: "", identification: "", phone: "", email: "", address: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      identification: client.identification,
      phone: client.phone,
      email: client.email || "",
      address: client.address || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId 
      ? await updateClient(editingId, formData)
      : await createClient(formData);
      
    if (res.success) {
      setIsModalOpen(false);
      Swal.fire({
        title: '¡Éxito!',
        text: editingId ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente',
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

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar cliente?")) return;
    const res = await deleteClient(id);
    if (res.success) {
      Swal.fire({
        title: '¡Eliminado!',
        text: 'Cliente eliminado correctamente',
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
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Gestión de Clientes</h1>
      </div>
      
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button className="btn btn-primary" onClick={openCreateModal}>+ Nuevo Cliente</button>
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
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => openEditModal(c)} className="btn btn-secondary">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="glass-panel" style={{ width: "400px", padding: "2rem" }}>
              <h2 className="h3">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Identificación</label>
                  <input className="form-input" required value={formData.identification} onChange={e => setFormData({...formData, identification: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
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
    </div>
  );
}
