"use client";

import { useState } from "react";
import { getReport, type ReportData } from "@/app/actions/reports";

const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;
const toInput = (iso: string) => iso.slice(0, 10);

function csvCell(v: string | number | boolean): string {
  return `"${String(v).replace(/"/g, '""')}"`;
}

export default function ReportsManager({ initialReport, initialError }: { initialReport: ReportData | null; initialError: string | null }) {
  const [report, setReport] = useState<ReportData | null>(initialReport);
  const [error, setError] = useState<string | null>(initialError);
  const [from, setFrom] = useState(initialReport ? toInput(initialReport.from) : "");
  const [to, setTo] = useState(initialReport ? toInput(initialReport.to) : "");
  const [loading, setLoading] = useState(false);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await getReport(from, to);
    setLoading(false);
    if (res.success) {
      setReport(res.data);
      setError(null);
    } else {
      setError(res.error);
    }
  };

  const downloadCSV = () => {
    if (!report) return;
    const lines: string[] = [];
    lines.push("RESUMEN FINANCIERO");
    lines.push(["Órdenes cerradas", "Facturas emitidas", "Mano de obra", "Repuestos", "Subtotal facturado", "IVA", "Total facturado"].map(csvCell).join(","));
    const f = report.financial;
    lines.push([f.ordersCount, f.invoicesCount, f.laborTotal, f.partsTotal, f.subtotal, f.tax, f.total].map(csvCell).join(","));
    lines.push("");
    lines.push("ÓRDENES CERRADAS");
    lines.push(["Orden", "Fecha", "Cliente", "Vehículo", "Mecánico", "Estado", "Mano de obra", "Repuestos", "Total", "Facturada"].map(csvCell).join(","));
    report.closedOrders.forEach((o) =>
      lines.push([o.id.slice(0, 8), o.date.slice(0, 10), o.client, o.vehicle, o.mechanic, o.status, o.laborCost, o.partsCost, o.totalCost, o.invoiced ? "Sí" : "No"].map(csvCell).join(","))
    );
    lines.push("");
    lines.push("CONSUMO DE REPUESTOS");
    lines.push(["Código", "Descripción", "Cantidad", "Total"].map(csvCell).join(","));
    report.partsConsumption.forEach((p) => lines.push([p.code, p.description, p.quantity, p.total].map(csvCell).join(",")));

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-autopro-${from || "inicio"}_${to || "hoy"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cell = { padding: "0.75rem 1rem" } as const;

  return (
    <div>
      <style>{`@media print { aside, .no-print { display: none !important; } .glass-panel { box-shadow: none !important; } }`}</style>

      <form onSubmit={handleFilter} className="glass-panel no-print" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Desde</label>
          <input type="date" className="form-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Hasta</label>
          <input type="date" className="form-input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Consultando..." : "Generar"}</button>
        <button type="button" className="btn btn-secondary" onClick={downloadCSV} disabled={!report}>⬇️ CSV</button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()} disabled={!report}>🖨️ Imprimir / PDF</button>
      </form>

      {error && <div className="glass-panel" style={{ padding: "1rem", color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}

      {report && (
        <>
          <h3 className="h3" style={{ marginBottom: "0.75rem" }}>Resumen financiero consolidado</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              ["Órdenes cerradas", String(report.financial.ordersCount)],
              ["Facturas emitidas", String(report.financial.invoicesCount)],
              ["Mano de obra", money(report.financial.laborTotal)],
              ["Repuestos", money(report.financial.partsTotal)],
              ["Subtotal facturado", money(report.financial.subtotal)],
              ["IVA", money(report.financial.tax)],
              ["Total facturado", money(report.financial.total)],
            ].map(([label, value]) => (
              <div key={label} className="glass-panel" style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{label}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>

          <h3 className="h3" style={{ marginBottom: "0.75rem" }}>Órdenes cerradas</h3>
          <div className="glass-panel" style={{ overflowX: "auto", marginBottom: "2rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {["Orden", "Fecha", "Cliente", "Vehículo", "Mecánico", "Estado", "Total", "Facturada"].map((h) => (
                    <th key={h} style={cell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.closedOrders.length === 0 && (
                  <tr><td colSpan={8} style={{ ...cell, textAlign: "center" }}>Sin órdenes cerradas en el rango.</td></tr>
                )}
                {report.closedOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={cell}>#{o.id.slice(0, 8)}</td>
                    <td style={cell}>{o.date.slice(0, 10)}</td>
                    <td style={cell}>{o.client}</td>
                    <td style={cell}>{o.vehicle}</td>
                    <td style={cell}>{o.mechanic}</td>
                    <td style={cell}>{o.status}</td>
                    <td style={cell}>{money(o.totalCost)}</td>
                    <td style={cell}>{o.invoiced ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="h3" style={{ marginBottom: "0.75rem" }}>Consumo de repuestos</h3>
          <div className="glass-panel" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {["Código", "Descripción", "Cantidad", "Total"].map((h) => (
                    <th key={h} style={cell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.partsConsumption.length === 0 && (
                  <tr><td colSpan={4} style={{ ...cell, textAlign: "center" }}>Sin consumo de repuestos en el rango.</td></tr>
                )}
                {report.partsConsumption.map((p) => (
                  <tr key={p.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={cell}>{p.code}</td>
                    <td style={cell}>{p.description}</td>
                    <td style={cell}>{p.quantity}</td>
                    <td style={cell}>{money(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
