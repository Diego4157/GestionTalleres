import { getDashboardStats } from "@/app/actions/dashboard";

export default async function DashboardPage() {
  const res = await getDashboardStats();
  const statsData = res.success && res.data ? res.data : {
    activeOrders: 0,
    totalClients: 0,
    totalVehicles: 0,
    totalSales: 0,
    lowStockItems: 0
  };

  const stats = [
    { label: "Órdenes Activas", value: statsData.activeOrders.toString(), color: "var(--accent-primary)" },
    { label: "Clientes Registrados", value: statsData.totalClients.toString(), color: "var(--success)" },
    { label: "Ingresos Totales", value: `$${statsData.totalSales.toLocaleString()}`, color: "#10b981" },
    { label: "Alertas de Inventario", value: statsData.lowStockItems.toString(), color: "var(--danger)" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="h2" style={{ marginBottom: "2rem" }}>Resumen Ejecutivo</h1>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: "1.5rem", borderTop: `4px solid ${stat.color}` }}>
            <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{stat.label}</h3>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 className="h3" style={{ marginBottom: "1rem" }}>Análisis de Negocio (BI)</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>Tendencias basadas en datos históricos.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Servicio más solicitado</div>
              <div style={{ fontWeight: 600 }}>Cambio de Aceite (Proyectado)</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Eficiencia Mecánica</div>
              <div style={{ fontWeight: 600 }}>92% (Promedio de entrega)</div>
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 className="h3" style={{ marginBottom: "1rem" }}>Estado de Inventario</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>Predicción de reabastecimiento.</p>
          {statsData.lowStockItems > 0 ? (
            <div style={{ color: "var(--danger)", padding: "1rem", border: "1px solid var(--danger)", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
              Hay <strong>{statsData.lowStockItems}</strong> productos por debajo del stock mínimo. Se recomienda realizar pedido.
            </div>
          ) : (
            <div style={{ color: "var(--success)", padding: "1rem", border: "1px solid var(--success)", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
              Todo el inventario está en niveles óptimos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
