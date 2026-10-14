import { getDashboardStats } from "@/controllers/DashboardController";
import { getDashboardKPIs, getMechanicPerformance, getRevenueTrend } from "@/app/actions/dashboard";
import DashboardView from "@/views/DashboardView";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guard";

export default async function DashboardPage() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) redirect("/dashboard/ordenes");

  const res = await getDashboardStats();
  const statsData = res.success && res.data ? res.data : {
    activeOrders: 0,
    totalClients: 0,
    totalVehicles: 0,
    totalSales: 0,
    lowStockItems: 0
  };

  const kpis = await getDashboardKPIs();
  const performance = await getMechanicPerformance();
  const trend = await getRevenueTrend();

  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando panel analítico...</div>}>
      <DashboardView 
        statsData={statsData} 
        kpis={kpis} 
        performance={performance} 
        trend={trend} 
      />
    </Suspense>
  );
}
