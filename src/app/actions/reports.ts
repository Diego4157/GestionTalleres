"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export type ReportData = {
  from: string;
  to: string;
  closedOrders: {
    id: string;
    date: string;
    client: string;
    vehicle: string;
    mechanic: string;
    status: string;
    laborCost: number;
    partsCost: number;
    totalCost: number;
    invoiced: boolean;
  }[];
  partsConsumption: { code: string; description: string; quantity: number; total: number }[];
  financial: {
    ordersCount: number;
    invoicesCount: number;
    laborTotal: number;
    partsTotal: number;
    subtotal: number;
    tax: number;
    total: number;
  };
};

export async function getReport(fromStr?: string, toStr?: string) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false as const, error: guard.error };

  const now = new Date();
  const from = fromStr ? new Date(`${fromStr}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = toStr ? new Date(`${toStr}T23:59:59.999`) : now;
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
    return { success: false as const, error: "Rango de fechas inválido." };
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["FINALIZADA", "ENTREGADA", "FACTURADA"] },
        updatedAt: { gte: from, lte: to },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { name: true } },
        vehicle: { select: { plate: true, brand: true, model: true } },
        mechanic: { select: { name: true } },
        parts: { include: { part: { select: { code: true, description: true } } } },
        invoice: { select: { id: true } },
      },
    });

    const consumption = new Map<string, { code: string; description: string; quantity: number; total: number }>();
    let laborTotal = 0;
    let partsTotal = 0;

    const closedOrders = orders.map((o) => {
      const partsCost = o.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
      laborTotal += o.laborCost;
      partsTotal += partsCost;
      for (const p of o.parts) {
        const cur = consumption.get(p.partId) ?? {
          code: p.part.code,
          description: p.part.description,
          quantity: 0,
          total: 0,
        };
        cur.quantity += p.quantity;
        cur.total += p.quantity * p.unitPrice;
        consumption.set(p.partId, cur);
      }
      return {
        id: o.id,
        date: o.updatedAt.toISOString(),
        client: o.client.name,
        vehicle: `${o.vehicle.brand} ${o.vehicle.model} (${o.vehicle.plate})`,
        mechanic: o.mechanic?.name ?? "Sin asignar",
        status: o.status,
        laborCost: o.laborCost,
        partsCost,
        totalCost: o.totalCost,
        invoiced: !!o.invoice,
      };
    });

    const invoices = await prisma.invoice.aggregate({
      _sum: { subtotal: true, tax: true, total: true },
      _count: true,
      where: { issueDate: { gte: from, lte: to } },
    });

    const data: ReportData = {
      from: from.toISOString(),
      to: to.toISOString(),
      closedOrders,
      partsConsumption: Array.from(consumption.values()).sort((a, b) => b.quantity - a.quantity),
      financial: {
        ordersCount: closedOrders.length,
        invoicesCount: invoices._count,
        laborTotal,
        partsTotal,
        subtotal: invoices._sum.subtotal ?? 0,
        tax: invoices._sum.tax ?? 0,
        total: invoices._sum.total ?? 0,
      },
    };
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: "Error al generar el reporte." };
  }
}
