"use server";

import { DashboardDAO } from "@/models/dao/DashboardDAO";

export async function getDashboardStats() {
  try {
    const stats = await DashboardDAO.getStats();
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return { success: false, error: "Error al cargar estadísticas." };
  }
}
