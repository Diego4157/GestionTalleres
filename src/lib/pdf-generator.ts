import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateOrderPDF = (order: any) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("ORDEN DE SERVICIO - AUTOPRO", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Orden #: ${order.id.slice(0, 8)}`, 15, 30);
  doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString()}`, 15, 35);
  doc.text(`Estado: ${order.status}`, 15, 40);

  doc.setFontSize(12);
  doc.text("INFORMACIÓN DEL CLIENTE", 15, 50);
  doc.setFontSize(10);
  doc.text(`Nombre: ${order.client.name}`, 15, 55);
  doc.text(`Identificación: ${order.client.identification}`, 15, 60);

  doc.setFontSize(12);
  doc.text("INFORMACIÓN DEL VEHÍCULO", 110, 50);
  doc.setFontSize(10);
  doc.text(`Placa: ${order.vehicle.plate}`, 110, 55);
  doc.text(`Marca: ${order.vehicle.brand}`, 110, 60);

  const partsData = order.parts ? order.parts.map((op: any) => [
    op.part.description,
    op.quantity,
    `$${op.unitPrice.toLocaleString()}`,
    `$${(op.quantity * op.unitPrice).toLocaleString()}`
  ]) : [];

  autoTable(doc, {
    startY: 80,
    head: [["Repuesto", "Cant.", "Precio Un.", "Subtotal"]],
    body: partsData,
    theme: "striped",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Mano de Obra: $${(order.laborCost || 0).toLocaleString()}`, 140, finalY);
  doc.setFontSize(14);
  doc.text(`TOTAL: $${order.totalCost.toLocaleString()}`, 140, finalY + 10);

  doc.save(`Orden_${order.id.slice(0, 8)}.pdf`);
};
