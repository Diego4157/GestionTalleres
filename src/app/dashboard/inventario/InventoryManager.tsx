"use client";

import { useState } from "react";
import { createInventoryItem, updateStock } from "@/app/actions/inventory";

export default function InventoryManager({ initialInventory }: { initialInventory: any[] }) {
  const [inventory] = useState(initialInventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", description: "", currentStock: 0, minStock: 5, purchasePrice: 0, salePrice: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createInventoryItem(formData);
    if (res.success) window.location.reload();
    else alert(res.error);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nuevo Producto</button>
      </div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Código</th>
              <th style={{ padding: "1rem" }}>Descripción</th>
              <th style={{ padding: "1rem" }}>Stock</th>
              <th style={{ padding: "1rem" }}>Precio Venta</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "450px", padding: "2rem" }}>
            <h2 className="h3">Nuevo Producto</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" required onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Código</label>
                  <input className="form-input" required onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Inicial</label>
                  <input type="number" className="form-input" required onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Precio Venta</label>
                <input type="number" className="form-input" required onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} />
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
