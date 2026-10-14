"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { startOfMonth, endOfMonth, subMonths, subWeeks, subDays, format, differenceInHours } from "date-fns";

import { requireRole } from "@/lib/auth-guard";

async function assertAdmin() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) throw new Error("Acceso denegado");
}

export async function getDashboardKPIs() {
  await assertAdmin();
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
  const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

  // 1. Ingresos totales del mes (basado en facturas emitidas)
  const currentMonthInvoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { issueDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } },
  });

  const previousMonthInvoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { issueDate: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } },
  });

  const currentRevenue = currentMonthInvoices._sum.total || 0;
  const previousRevenue = previousMonthInvoices._sum.total || 0;
  
  let revenueGrowth = 0;
  if (previousRevenue > 0) {
    revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  } else if (currentRevenue > 0) {
    revenueGrowth = 100;
  }

  // 2. Tiempo promedio de entrega de órdenes (FINALIZADA, ENTREGADA, FACTURADA)
  const completedOrders = await prisma.order.findMany({
    where: { status: { in: [OrderStatus.FINALIZADA, OrderStatus.ENTREGADA] } },
    select: { createdAt: true, updatedAt: true }
  });

  let totalDeliveryHours = 0;
  completedOrders.forEach(order => {
    totalDeliveryHours += differenceInHours(order.updatedAt, order.createdAt);
  });
  
  const avgDeliveryHours = completedOrders.length > 0 ? (totalDeliveryHours / completedOrders.length) : 0;

  // 3. Repuesto más consumido
  const topPartResult = await prisma.orderPart.groupBy({
    by: ['partId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 1
  });

  let mostConsumedPartName = "N/A";
  if (topPartResult.length > 0) {
    const part = await prisma.inventory.findUnique({ where: { id: topPartResult[0].partId } });
    mostConsumedPartName = part ? part.description : "Desconocido";
  }

  return {
    currentRevenue,
    revenueGrowth,
    avgDeliveryHours: Math.round(avgDeliveryHours),
    mostConsumedPartName
  };
}

export async function getMechanicPerformance() {
  await assertAdmin();
  const mechanics = await prisma.user.findMany({
    where: { role: "MECHANIC", isActive: true },
    select: { id: true, name: true }
  });

  const performance = await Promise.all(mechanics.map(async (mechanic) => {
    const orders = await prisma.order.findMany({
      where: { 
        mechanicId: mechanic.id,
        status: { in: [OrderStatus.FINALIZADA, OrderStatus.ENTREGADA] }
      },
      select: { createdAt: true, updatedAt: true }
    });

    const totalOrders = orders.length;
    let totalHours = 0;
    orders.forEach(o => {
      totalHours += Math.abs(differenceInHours(o.updatedAt, o.createdAt));
    });

    const avgHours = totalOrders > 0 ? (totalHours / totalOrders) : 0;

    return {
      name: mechanic.name,
      totalOrders,
      avgResolutionTime: Math.round(avgHours)
    };
  }));

  return performance;
}

export async function getRevenueTrend() {
  await assertAdmin();
  const now = new Date();
  const trend = [];
  
  // Obtenemos ingresos de las últimas 4 semanas
  for (let i = 4; i >= 0; i--) {
    const start = subWeeks(now, i);
    const end = i === 0 ? now : subDays(subWeeks(now, i - 1), 1);
    
    const invoices = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { issueDate: { gte: start, lte: end } }
    });

    trend.push({
      period: `Sem ${format(start, 'dd/MM')}`,
      revenue: invoices._sum.total || 0
    });
  }

  return trend;
}
