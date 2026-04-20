"use client";

import { useState } from "react";
import { updateOrderStatus, updateOrderDetails, addPartToOrder } from "@/app/actions/order";
import { createInvoiceFromOrder } from "@/app/actions/invoice";
import { OrderStatus } from "@prisma/client";
import { generateOrderPDF } from "@/lib/pdf-generator";
import Link from "next/link";

export default function OrderDetailManager({ order, inventory }: { order: any, inventory: any[] }) {
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [diagnosis, setDiagnosis] = useState(order.diagnosis || "");
  const [laborCost, setLaborCost] = useState(order.laborCost || 0);
  
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    const res = await updateOrderStatus(order.id, newStatus);
    if (res.success) setCurrentOrder({ ...currentOrder, status: newStatus });
    setLoading(false);
  };

  const handleSaveDetails = async () => {
    setLoading(true);
    const res = await updateOrderDetails(order.id, { diagnosis, laborCost });
    if (res.success) window.location.reload();
    setLoading(false);
  };

  const handleAddPart = async () => {
    if (!selectedPartId) return;
    setLoading(true);
    const res = await addPartToOrder(order.id, { partId: selectedPartId, quantity });
    if (res.success) window.location.reload();
    else { alert(res.error); setLoading(false); }
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    const res = await createInvoiceFromOrder(order.id);
    if (res.success) window.location.reload();
    else alert(res.error);
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/dashboard/ordenes">← Volver</Link>
        <h1 className="h2">Orden #{order.id.slice(0, 8)}</h1>
        <button className="btn btn-secondary" onClick={() => generateOrderPDF(currentOrder)}>📄 PDF</button>
        {(currentOrder.status === "FINALIZADA" || currentOrder.status === "ENTREGADA") && !order.invoice && (
          <button className="btn btn-primary" onClick={handleGenerateInvoice} disabled={loading}>💰 Facturar</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3 className="h3">Diagnóstico</h3>
          <textarea className="form-input" rows={4} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label">Mano de Obra ($)</label>
            <input type="number" className="form-input" value={laborCost} onChange={e => setLaborCost(Number(e.target.value))} />
          </div>
          <button className="btn btn-primary" onClick={handleSaveDetails} disabled={loading}>Guardar</button>
        </div>

        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3 className="h3">Estado</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            {["REGISTRADA", "EN_DIAGNOSTICO", "EN_REPARACION", "FINALIZADA", "ENTREGADA"].map(s => (
              <button key={s} className="btn" style={{ 
                backgroundColor: currentOrder.status === s ? "var(--accent-primary)" : "transparent",
                color: currentOrder.status === s ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                justifyContent: "flex-start"
              }} onClick={() => handleStatusChange(s as OrderStatus)}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: "2rem", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 className="h3">Repuestos</h3>
          <button className="btn btn-secondary" onClick={() => setIsPartsModalOpen(true)}>+ Agregar</button>
        </div>
        <table style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th style={{ padding: "1rem" }}>Repuesto</th>
              <th style={{ padding: "1rem" }}>Cant.</th>
              <th style={{ padding: "1rem" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {currentOrder.parts.map((p: any) => (
              <tr key={p.id}>
                <td style={{ padding: "1rem" }}>{p.part.description}</td>
                <td style={{ padding: "1rem" }}>{p.quantity}</td>
                <td style={{ padding: "1rem" }}>${(p.quantity * p.unitPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "1rem", textAlign: "right", fontWeight: "bold", fontSize: "1.25rem" }}>
          Total Orden: ${currentOrder.totalCost.toLocaleString()}
        </div>
      </div>

      {isPartsModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "400px", padding: "2rem" }}>
            <h2 className="h3">Agregar Repuesto</h2>
            <select className="form-input" onChange={e => setSelectedPartId(e.target.value)}>
              <option value="">Seleccione...</option>
              {inventory.map(item => <option key={item.id} value={item.id}>{item.description}</option>)}
            </select>
            <input type="number" className="form-input" style={{ marginTop: "1rem" }} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setIsPartsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAddPart}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
