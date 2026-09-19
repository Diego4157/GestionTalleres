import { prisma } from "@/lib/prisma";

export class DashboardDAO {
  static async getStats() {
    const [activeOrders, totalClients, totalVehicles, totalSales] = await Promise.all([
      prisma.order.count({
        where: { NOT: { status: { in: ["FINALIZADA", "ENTREGADA"] } } }
      }),
      prisma.client.count(),
      prisma.vehicle.count(),
      prisma.invoice.aggregate({ _sum: { total: true } })
    ]);

    const lowStockItems = await prisma.inventory.count({
      where: { currentStock: { lte: prisma.inventory.fields.minStock } }
    });

    return {
      activeOrders,
      totalClients,
      totalVehicles,
      totalSales: totalSales._sum.total || 0,
      lowStockItems
    };
  }
}
