"use client";

import { useState } from "react";
import { generateInvoicePDF } from "@/lib/pdf-generator";

export default function InvoiceManager({ initialInvoices }: { initialInvoices: any[] }) {
  const [invoices] = useState(initialInvoices);

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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
