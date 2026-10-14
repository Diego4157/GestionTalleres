"use server";

import { OrdenDAO } from "@/models/dao/OrdenDAO";
import { ClienteDAO } from "@/models/dao/ClienteDAO";
import { NotificationService } from "@/services/NotificationService";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";
import { ReceptionChecklistValue } from "@/lib/reception";
import {
  updateOrderStatus as updateOrderStatusAction,
  updateOrderDetails as updateOrderDetailsAction,
  addPartToOrder as addPartToOrderAction,
} from "@/app/actions/order";

export async function getOrders() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const orders = await OrdenDAO.getAll();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "Error al cargar las órdenes." };
  }
}

export async function createOrder(data: { clientId: string; vehicleId: string; mechanicId?: string; fuelLevel: string; checklist?: ReceptionChecklistValue; }) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const newOrder = await OrdenDAO.create({
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId || null,
      fuelLevel: data.fuelLevel,
      checklist: data.checklist,
      status: "REGISTRADA",
    });
    revalidatePath("/dashboard/ordenes");
    
    const client = await ClienteDAO.getById(data.clientId);
    if (client) {
      await NotificationService.sendWhatsApp(client.phone, `Hola ${client.name}, tu orden de servicio #${newOrder.id.slice(0,8)} ha sido registrada.`);
    }

    return { success: true, data: newOrder };
  } catch (error) {
    return { success: false, error: "Error al crear la orden." };
  }
}

// Las mutaciones restantes se delegan a las Server Actions protegidas por rol.
export async function updateOrderStatus(id: string, status: OrderStatus) {
  return updateOrderStatusAction(id, status);
}

export async function updateOrderDetails(id: string, data: { diagnosis: string; laborCost: number; }) {
  return updateOrderDetailsAction(id, data);
}

export async function addPartToOrder(orderId: string, data: { partId: string; quantity: number; }) {
  return addPartToOrderAction(orderId, data);
}
