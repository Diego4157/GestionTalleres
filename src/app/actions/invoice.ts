"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { issueDate: "desc" },
      include: {
        order: { include: { client: true, vehicle: true, parts: { include: { part: true } } } }
      }
    });
    return { success: true, data: invoices };
  } catch (error) {
    return { success: false, error: "Error al cargar facturas." };
  }
}

export async function createInvoiceFromOrder(orderId: string) {
  try {
    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return { success: false, error: "Ya existe factura." };

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return { success: false, error: "Orden no encontrada." };
    
    const subtotal = order.totalCost;
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const newInvoice = await prisma.invoice.create({
      data: { orderId: order.id, subtotal, tax, total }
    });

    revalidatePath("/dashboard/facturas");
    revalidatePath(`/dashboard/ordenes/${orderId}`);
    return { success: true, data: newInvoice };
  } catch (error) {
    return { success: false, error: "Error al generar factura." };
  }
}

export async function updateInvoice(id: string, data: { subtotal: number; tax: number; total: number }) {
  try {
    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total
      }
    });
    revalidatePath("/dashboard/facturas");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar la factura." };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/dashboard/facturas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar la factura." };
  }
}
