"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus, Prisma } from "@prisma/client";
import { sendWhatsAppNotification } from "@/lib/notifications";
import { requireRole } from "@/lib/auth-guard";
import { ReceptionChecklistValue } from "@/lib/reception";

// Estados que el rol MECHANIC puede asignar.
const MECHANIC_ALLOWED_STATUS: OrderStatus[] = ["EN_DIAGNOSTICO", "EN_REPARACION", "FINALIZADA"];

export async function getOrders() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        vehicle: true,
        mechanic: true,
        invoice: true,
      },
    });
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "Error al cargar las órdenes." };
  }
}

export async function createOrder(data: { clientId: string; vehicleId: string; mechanicId?: string; fuelLevel: string; checklist?: ReceptionChecklistValue; }) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const newOrder = await prisma.order.create({
      data: {
        clientId: data.clientId,
        vehicleId: data.vehicleId,
        mechanicId: data.mechanicId || null,
        fuelLevel: data.fuelLevel,
        checklist: data.checklist ? (data.checklist as unknown as Prisma.InputJsonValue) : undefined,
        status: "REGISTRADA",
      },
    });
    revalidatePath("/dashboard/ordenes");
    
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (client) {
      await sendWhatsAppNotification(client.phone, `Hola ${client.name}, tu orden de servicio #${newOrder.id.slice(0,8)} ha sido registrada.`);
    }

    return { success: true, data: newOrder };
  } catch (error) {
    return { success: false, error: "Error al crear la orden." };
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };
  if (guard.role === "MECHANIC" && !MECHANIC_ALLOWED_STATUS.includes(status)) {
    return { success: false, error: "Acceso denegado: el mecánico no puede asignar este estado." };
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { client: true, vehicle: true }
    });
    
    if (updatedOrder.client) {
      if (status === "FINALIZADA" || status === "ENTREGADA") {
        await sendWhatsAppNotification(updatedOrder.client.phone, `Su vehículo ${updatedOrder.vehicle.plate} se encuentra listo para entrega en el taller`);
      } else {
        await sendWhatsAppNotification(updatedOrder.client.phone, `Tu vehículo (${updatedOrder.vehicle.plate}) ahora está en estado: ${status}`);
      }
    }

    revalidatePath("/dashboard/ordenes");
    revalidatePath(`/dashboard/ordenes/${id}`);
    return { success: true, data: updatedOrder };
  } catch (error) {
    return { success: false, error: "Error al actualizar estado." };
  }
}

export async function updateOrderDetails(id: string, data: { diagnosis: string; laborCost: number; }) {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { parts: true }
    });
    if (!currentOrder) return { success: false, error: "Orden no encontrada." };
    if (currentOrder.status === "FACTURADA") return { success: false, error: "No se puede modificar una orden ya facturada." };

    // El mecánico no puede alterar la mano de obra (dato financiero).
    const laborCost = guard.role === "MECHANIC" ? currentOrder.laborCost : Number(data.laborCost);
    const partsTotal = currentOrder.parts.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
    const totalCost = partsTotal + laborCost;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        diagnosis: data.diagnosis,
        laborCost,
        totalCost,
      }
    });
    revalidatePath(`/dashboard/ordenes/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar detalles." };
  }
}

export async function updateOrderReception(id: string, data: { fuelLevel: string; checklist: ReceptionChecklistValue; }) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) return { success: false, error: "Orden no encontrada." };
    if (currentOrder.status === "FACTURADA") return { success: false, error: "No se puede modificar una orden ya facturada." };

    const updated = await prisma.order.update({
      where: { id },
      data: {
        fuelLevel: data.fuelLevel,
        checklist: data.checklist as unknown as Prisma.InputJsonValue,
      }
    });
    revalidatePath(`/dashboard/ordenes/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al guardar la recepción del vehículo." };
  }
}

export async function addPartToOrder(orderId: string, data: { partId: string; quantity: number; }) {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const orderCheck = await prisma.order.findUnique({ where: { id: orderId } });
    if (!orderCheck) return { success: false, error: "Orden no encontrada." };
    if (orderCheck.status === "FACTURADA") return { success: false, error: "No se puede modificar una orden ya facturada." };

    const part = await prisma.inventory.findUnique({ where: { id: data.partId } });
    if (!part) return { success: false, error: "Repuesto no encontrado." };
    if (part.currentStock < data.quantity) return { success: false, error: "Stock insuficiente." };

    const result = await prisma.$transaction(async (tx) => {
      const orderPart = await tx.orderPart.create({
        data: {
          orderId,
          partId: data.partId,
          quantity: data.quantity,
          unitPrice: part.salePrice
        }
      });

      await tx.inventory.update({
        where: { id: data.partId },
        data: { currentStock: { decrement: data.quantity } }
      });

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { parts: true }
      });

      const partsTotal = order?.parts.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0) || 0;
      const totalCost = partsTotal + (order?.laborCost || 0);

      await tx.order.update({
        where: { id: orderId },
        data: { totalCost }
      });

      return orderPart;
    });

    revalidatePath(`/dashboard/ordenes/${orderId}`);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Error al agregar repuesto." };
  }
}
