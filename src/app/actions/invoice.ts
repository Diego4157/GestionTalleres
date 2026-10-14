"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";

export async function getInvoices() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

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
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

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

    const newInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: { orderId: order.id, subtotal, tax, total }
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "FACTURADA" }
      });
      return invoice;
    });

    revalidatePath("/dashboard/facturas");
    revalidatePath(`/dashboard/ordenes/${orderId}`);
    return { success: true, data: newInvoice };
  } catch (error) {
    return { success: false, error: "Error al generar factura." };
  }
}

export async function updateInvoice(id: string, data: any) {
  return { success: false, error: "Una factura emitida es un documento fiscal inmutable y no puede ser alterada" };
}

export async function deleteInvoice(id: string) {
  return { success: false, error: "Una factura emitida es un documento fiscal inmutable y no puede ser alterada" };
}
