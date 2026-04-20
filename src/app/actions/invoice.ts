"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { issueDate: "desc" },
      include: {
        order: { include: { client: true, vehicle: true } }
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
