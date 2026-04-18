"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
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
      success: true,
      data: {
        activeOrders,
        totalClients,
        totalVehicles,
        totalSales: totalSales._sum.total || 0,
        lowStockItems
      }
    };
  } catch (error) {
    return { success: false, error: "Error al cargar estadísticas." };
  }
}
