"use client";

import { useState } from "react";
import { updateOrderStatus, updateOrderDetails, addPartToOrder, updateOrderReception } from "@/app/actions/order";
import { createInvoiceFromOrder } from "@/app/actions/invoice";
import { OrderStatus } from "@prisma/client";
import { generateOrderPDF } from "@/lib/pdf-generator";
import Link from "next/link";
import Swal from "sweetalert2";
import DiagnosticAIAssistant from "./DiagnosticAIAssistant";
import ReceptionChecklist from "@/components/ReceptionChecklist";
import { parseChecklist, ReceptionChecklistValue } from "@/lib/reception";

export default function OrderDetailManager({ order, inventory, role }: { order: any, inventory: any[], role: string }) {
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [diagnosis, setDiagnosis] = useState(order.diagnosis || "");
  const [laborCost, setLaborCost] = useState(order.laborCost || 0);
  const [fuelLevel, setFuelLevel] = useState<string>(order.fuelLevel || "1/2");
  const [checklist, setChecklist] = useState<ReceptionChecklistValue>(parseChecklist(order.checklist));
  
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const isMechanic = role === "MECHANIC";

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    const res = await updateOrderStatus(order.id, newStatus);
    if (res.success) {
      setCurrentOrder({ ...currentOrder, status: newStatus });
      Swal.fire({
        title: '¡Estado actualizado!',
        text: `El estado cambió a ${newStatus}`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
    setLoading(false);
  };

  const handleSaveDetails = async () => {
    setLoading(true);
    const res = await updateOrderDetails(order.id, { diagnosis, laborCost });
    if (res.success) {
      Swal.fire({
        title: '¡Guardado!',
        text: 'Detalles de la orden guardados exitosamente',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => window.location.reload());
    } else {
      Swal.fire('Error', 'No se pudieron guardar los detalles', 'error');
    }
    setLoading(false);
  };

  const handleAddPart = async () => {
    if (!selectedPartId) return;
    setLoading(true);
    const res = await addPartToOrder(order.id, { partId: selectedPartId, quantity });
    if (res.success) {
      setIsPartsModalOpen(false);
      Swal.fire({
        title: '¡Repuesto agregado!',
        text: 'El repuesto fue agregado a la orden',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => window.location.reload());
    } else {
      Swal.fire('Error', res.error || 'No se pudo agregar repuesto', 'error');
      setLoading(false);
    }
  };

  const handleQuickAddPart = async (partId: string) => {
    setLoading(true);
    const res = await addPartToOrder(order.id, { partId, quantity: 1 });
    if (res.success) {
      Swal.fire({
        title: '¡Repuesto agregado!',
        text: 'El repuesto sugerido por la IA fue cargado a la orden',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => window.location.reload());
    } else {
      Swal.fire('Error', res.error || 'No se pudo agregar el repuesto', 'error');
      setLoading(false);
    }
  };

  const handleSaveReception = async () => {
    setLoading(true);
    const res = await updateOrderReception(order.id, { fuelLevel, checklist });
    if (res.success) {
      Swal.fire({
        title: '¡Recepción guardada!',
        text: 'El nivel de gasolina y el checklist fueron registrados',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire('Error', res.error || 'No se pudo guardar la recepción', 'error');
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    const res = await createInvoiceFromOrder(order.id);
    if (res.success) {
      Swal.fire({
        title: '¡Factura generada!',
        text: 'La factura ha sido creada exitosamente',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => window.location.reload());
    } else {
      Swal.fire('Error', res.error || 'No se pudo generar la factura', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/dashboard/ordenes">← Volver</Link>
        <h1 className="h2">Orden #{order.id.slice(0, 8)}</h1>
        <button className="btn btn-secondary" onClick={() => generateOrderPDF(currentOrder)}>📄 PDF</button>
        {role === "ADMIN" && (currentOrder.status === "FINALIZADA" || currentOrder.status === "ENTREGADA") && !order.invoice && (
          <button className="btn btn-primary" onClick={handleGenerateInvoice} disabled={loading}>💰 Facturar</button>
        )}
      </div>

      <div className="responsive-grid-detail" style={{ display: "grid", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <DiagnosticAIAssistant
            orderId={order.id}
            vehicle={order.vehicle}
            inventory={inventory}
            currentDiagnosis={diagnosis}
            onDiagnosisUpdated={(newDiag) => setDiagnosis(newDiag)}
            onSelectPartToAdd={handleQuickAddPart}
            preDiagnosisInitial={order.preDiagnosis}
          />

          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 className="h3">Sugerencias de Servicio Inteligente ({order.vehicle?.tipo || "CARRO"} - {order.vehicle?.mileage?.toLocaleString() || 0} km)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {(() => {
                const m = order.vehicle?.mileage || 0;
                const tipo = order.vehicle?.tipo || "CARRO";
                const list = [];
                if (m > 0) {
                  if (tipo === "MOTO") {
                    if (m >= 2500 && m <= 3500) list.push("Cambio de aceite de motor (4T/2T) y limpieza/lubricación de cadena de arrastre");
                    if (m >= 5000 && m <= 8000) list.push("Inspección de zapatas/pastillas de freno, filtro de aire y holgura de guayas");
                    if (m >= 10000 && m <= 15000) list.push("Cambio de bujía, calibración de válvulas y verificación de kit de arrastre");
                  } else {
                    if (m >= 5000 && m <= 10000) list.push("Cambio de aceite sintético/mineral, filtro de aceite y filtro de aire de motor");
                    if (m >= 20000 && m <= 30000) list.push("Revisión y cambio de pastillas de freno, rotación de llantas, alineación y balanceo");
                    if (m >= 40000 && m <= 50000) list.push("Inspección de suspensión, líquido de frenos, bujías y correa de distribución/accesorios");
                  }
                  if (list.length === 0) list.push("Revisión general de seguridad (Sugerida)");
                } else {
                  list.push("Kilometraje no registrado. Recomendamos revisión general.");
                }
                return list.map((sug, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{sug}</span>
                    <button className="btn btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }} onClick={() => setDiagnosis((prev: string) => prev ? `${prev}\n- ${sug}` : `- ${sug}`)}>
                      Cargar a la orden
                    </button>
                  </div>
                ));
              })()}
            </div>

            <h3 className="h3">Diagnóstico y Detalles</h3>
            <textarea className="form-input" rows={4} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
            {!isMechanic && (
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label className="form-label">Mano de Obra ($)</label>
                <input type="number" className="form-input" value={laborCost} onChange={e => setLaborCost(Number(e.target.value))} />
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSaveDetails} disabled={loading} style={{ marginTop: "1rem" }}>Guardar</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignSelf: "start" }}>
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 className="h3">Estado</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
              {["REGISTRADA", "EN_DIAGNOSTICO", "EN_REPARACION", "FINALIZADA", "ENTREGADA"].map(s => {
                if (isMechanic && !["EN_DIAGNOSTICO", "EN_REPARACION", "FINALIZADA"].includes(s) && currentOrder.status !== s) return null;
                return (
                  <button key={s} className="btn" style={{ 
                    backgroundColor: currentOrder.status === s ? "var(--accent-primary)" : "transparent",
                    color: currentOrder.status === s ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    justifyContent: "flex-start"
                  }} onClick={() => handleStatusChange(s as OrderStatus)}>{s}</button>
                );
              })}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 className="h3" style={{ marginBottom: "1rem" }}>Recepción del Vehículo</h3>
            <ReceptionChecklist
              fuelLevel={fuelLevel}
              checklist={checklist}
              tipo={order.vehicle?.tipo === "MOTO" ? "MOTO" : "CARRO"}
              disabled={currentOrder.status === "FACTURADA"}
              onFuelChange={setFuelLevel}
              onChecklistChange={setChecklist}
            />
            {currentOrder.status !== "FACTURADA" && (
              <button className="btn btn-primary" onClick={handleSaveReception} disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
                💾 Guardar recepción y fotos
              </button>
            )}
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
              {!isMechanic && <th style={{ padding: "1rem" }}>Subtotal</th>}
            </tr>
          </thead>
          <tbody>
            {currentOrder.parts.map((p: any) => (
              <tr key={p.id}>
                <td style={{ padding: "1rem" }}>{p.part.description}</td>
                <td style={{ padding: "1rem" }}>{p.quantity}</td>
                {!isMechanic && <td style={{ padding: "1rem" }}>${(p.quantity * p.unitPrice).toLocaleString()}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {!isMechanic && (
          <div style={{ marginTop: "1rem", textAlign: "right", fontWeight: "bold", fontSize: "1.25rem" }}>
            Total Orden: ${currentOrder.totalCost.toLocaleString()}
          </div>
        )}
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
