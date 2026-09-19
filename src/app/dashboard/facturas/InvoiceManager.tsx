"use client";

import { useState } from "react";
import { updateInvoice, deleteInvoice } from "@/app/actions/invoice";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import Swal from "sweetalert2";

export default function InvoiceManager({ initialInvoices }: { initialInvoices: any[] }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta factura?")) {
      const res = await deleteInvoice(id);
      if (res.success) {
        Swal.fire('¡Eliminada!', 'La factura fue eliminada', 'success').then(() => window.location.reload());
      } else {
        Swal.fire('Error', res.error, 'error');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    const res = await updateInvoice(editingInvoice.id, {
      subtotal: Number(editingInvoice.subtotal),
      tax: Number(editingInvoice.tax),
      total: Number(editingInvoice.total)
    });
    if (res.success) {
      setIsEditModalOpen(false);
      Swal.fire('¡Actualizada!', 'La factura se actualizó', 'success').then(() => window.location.reload());
    } else {
      Swal.fire('Error', res.error, 'error');
    }
  };

  const openEditModal = (inv: any) => {
    setEditingInvoice({ ...inv });
    setIsEditModalOpen(true);
  };

  const calculateTotal = (sub: number, tax: number) => {
    setEditingInvoice({ ...editingInvoice, subtotal: sub, tax: tax, total: sub + tax });
  };

  return (
    <div>
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Factura #</th>
              <th style={{ padding: "1rem" }}>Fecha</th>
              <th style={{ padding: "1rem" }}>Cliente</th>
              <th style={{ padding: "1rem" }}>Total</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ padding: "1rem" }}>{inv.id.slice(0, 8)}</td>
                <td style={{ padding: "1rem" }}>{new Date(inv.issueDate).toLocaleDateString()}</td>
                <td style={{ padding: "1rem" }}>{inv.order?.client?.name || 'N/A'}</td>
                <td style={{ padding: "1rem", fontWeight: "bold" }}>${inv.total.toLocaleString()}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => generateInvoicePDF(inv)}>📄 PDF</button>
                    <button className="btn btn-secondary" onClick={() => openEditModal(inv)}>Editar</button>
                    <button className="btn btn-secondary" style={{ color: "var(--danger)" }} onClick={() => handleDelete(inv.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && editingInvoice && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "400px", padding: "2rem" }}>
            <h2 className="h3">Editar Factura</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label className="form-label">Subtotal</label>
                <input type="number" className="form-input" value={editingInvoice.subtotal} onChange={e => calculateTotal(Number(e.target.value), editingInvoice.tax)} />
              </div>
              <div className="form-group">
                <label className="form-label">Impuestos (IVA)</label>
                <input type="number" className="form-input" value={editingInvoice.tax} onChange={e => calculateTotal(editingInvoice.subtotal, Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Total</label>
                <input type="number" className="form-input" disabled value={editingInvoice.total} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
