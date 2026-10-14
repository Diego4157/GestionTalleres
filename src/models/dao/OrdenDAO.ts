import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { ReceptionChecklistValue } from "@/lib/reception";

export class OrdenDAO {
  static async getAll() {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        vehicle: true,
        mechanic: true,
        invoice: true,
      },
    });
  }

  static async getById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: { parts: true, client: true, vehicle: true }
    });
  }

  static async create(data: { clientId: string; vehicleId: string; mechanicId: string | null; fuelLevel: string; checklist?: ReceptionChecklistValue; status: OrderStatus; }) {
    const { checklist, ...rest } = data;
    return await prisma.order.create({
      data: {
        ...rest,
        checklist: checklist ? (checklist as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  static async updateStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: { client: true, vehicle: true }
    });
  }

  static async updateDetails(id: string, data: { diagnosis: string; laborCost: number; totalCost: number; }) {
    return await prisma.order.update({
      where: { id },
      data
    });
  }
}
