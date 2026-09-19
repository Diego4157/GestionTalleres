"use client";

import { useState } from "react";
import { createInventoryItem, updateStock, updateInventoryItem, deleteInventoryItem } from "@/app/actions/inventory";
import Swal from "sweetalert2";

export default function InventoryManager({ initialInventory }: { initialInventory: any[] }) {
  const [inventory] = useState(initialInventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: "", description: "", currentStock: 0, minStock: 5, purchasePrice: 0, salePrice: 0 });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ code: "", description: "", currentStock: 0, minStock: 5, purchasePrice: 0, salePrice: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      code: item.code,
      description: item.description,
      currentStock: item.currentStock,
      minStock: item.minStock,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return;
    const res = await deleteInventoryItem(id);
    if (res.success) {
      Swal.fire('¡Eliminado!', 'El producto fue eliminado', 'success').then(() => window.location.reload());
    } else {
      Swal.fire('Error', res.error, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId 
      ? await updateInventoryItem(editingId, formData)
      : await createInventoryItem(formData);
      
    if (res.success) {
      setIsModalOpen(false);
      Swal.fire({
        title: '¡Éxito!',
        text: editingId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
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
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Nuevo Producto</button>
      </div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Código</th>
              <th style={{ padding: "1rem" }}>Descripción</th>
              <th style={{ padding: "1rem" }}>Stock</th>
              <th style={{ padding: "1rem" }}>Precio Venta</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "1rem" }}>{item.code}</td>
                <td style={{ padding: "1rem" }}>{item.description}</td>
                <td style={{ padding: "1rem", color: item.currentStock <= item.minStock ? "var(--danger)" : "var(--success)" }}>
                  {item.currentStock} {item.currentStock <= item.minStock && "(Stock Bajo)"}
                </td>
                <td style={{ padding: "1rem" }}>${item.salePrice.toLocaleString()}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => openEditModal(item)} className="btn btn-secondary">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>Eliminar</button>
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
            <h2 className="h3">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Código</label>
                  <input className="form-input" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Actual</label>
                  <input type="number" className="form-input" required value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Stock Mínimo</label>
                  <input type="number" className="form-input" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio Compra</label>
                  <input type="number" className="form-input" required value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Precio Venta</label>
                <input type="number" className="form-input" required value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} />
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
  );
}
