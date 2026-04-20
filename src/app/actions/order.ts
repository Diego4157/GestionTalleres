"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { sendWhatsAppNotification } from "@/lib/notifications";

export async function getOrders() {
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

export async function createOrder(data: { clientId: string; vehicleId: string; mechanicId?: string; fuelLevel: string; }) {
  try {
    const newOrder = await prisma.order.create({
      data: {
        clientId: data.clientId,
        vehicleId: data.vehicleId,
        mechanicId: data.mechanicId || null,
        fuelLevel: data.fuelLevel,
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
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { client: true, vehicle: true }
    });
    
    if (updatedOrder.client) {
      await sendWhatsAppNotification(updatedOrder.client.phone, `Tu vehículo (${updatedOrder.vehicle.plate}) ahora está en estado: ${status}`);
    }

    revalidatePath("/dashboard/ordenes");
    revalidatePath(`/dashboard/ordenes/${id}`);
    return { success: true, data: updatedOrder };
  } catch (error) {
    return { success: false, error: "Error al actualizar estado." };
  }
}

export async function updateOrderDetails(id: string, data: { diagnosis: string; laborCost: number; }) {
  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { parts: true }
    });
    if (!currentOrder) return { success: false, error: "Orden no encontrada." };

    const partsTotal = currentOrder.parts.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
    const totalCost = partsTotal + Number(data.laborCost);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        diagnosis: data.diagnosis,
        laborCost: Number(data.laborCost),
        totalCost,
      }
    });
    revalidatePath(`/dashboard/ordenes/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar detalles." };
  }
}

export async function addPartToOrder(orderId: string, data: { partId: string; quantity: number; }) {
  try {
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
