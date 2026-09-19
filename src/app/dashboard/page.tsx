import { getDashboardStats } from "@/controllers/DashboardController";
import DashboardView from "@/views/DashboardView";

export default async function DashboardPage() {
  const res = await getDashboardStats();
  const statsData = res.success && res.data ? res.data : {
    activeOrders: 0,
    totalClients: 0,
    totalVehicles: 0,
    totalSales: 0,
    lowStockItems: 0
  };

  return <DashboardView statsData={statsData} />;
}
