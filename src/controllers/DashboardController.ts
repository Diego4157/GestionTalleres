"use server";

import { DashboardDAO } from "@/models/dao/DashboardDAO";
import { requireRole } from "@/lib/auth-guard";

export async function getDashboardStats() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

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
