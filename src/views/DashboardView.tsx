"use client";

import { MechanicPerformanceChart, RevenueTrendChart } from "@/app/dashboard/DashboardCharts";

export default function DashboardView({ statsData, kpis, performance, trend }: { statsData: any, kpis: any, performance: any[], trend: any[] }) {
  const stats = [
    { label: "Ingresos del Mes", value: `$${kpis.currentRevenue.toLocaleString()}`, color: "#10b981", subtitle: `${kpis.revenueGrowth >= 0 ? '+' : ''}${kpis.revenueGrowth.toFixed(1)}% vs anterior` },
    { label: "Órdenes Activas", value: statsData.activeOrders.toString(), color: "var(--accent-primary)" },
    { label: "Promedio Entrega", value: `${kpis.avgDeliveryHours} horas`, color: "#3b82f6" },
    { label: "Repuesto Top", value: kpis.mostConsumedPartName, color: "#f59e0b" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="h2" style={{ marginBottom: "2rem" }}>Panel Analítico Ejecutivo (BI)</h1>
      
      {/* KPIs Principales */}
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
            {stat.subtitle && <p style={{ fontSize: "0.75rem", color: kpis.revenueGrowth >= 0 ? "var(--success)" : "var(--danger)", marginTop: "0.5rem" }}>{stat.subtitle}</p>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {/* Gráfico de Tendencia de Ingresos */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 className="h3" style={{ marginBottom: "1rem" }}>Tendencia de Ingresos (Últimas 4 semanas)</h2>
          <RevenueTrendChart data={trend} />
        </div>

        {/* Rendimiento por Mecánico */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 className="h3" style={{ marginBottom: "1rem" }}>Rendimiento y Eficiencia Operativa por Mecánico</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>Total de órdenes finalizadas y su tiempo medio de resolución.</p>
          <MechanicPerformanceChart data={performance} />
        </div>
      </div>
    </div>
  );
}
