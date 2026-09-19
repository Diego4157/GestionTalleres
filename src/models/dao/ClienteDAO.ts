import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export class ClienteDAO {
  static async getAll() {
    return await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { vehicles: true, orders: true } }
      }
    });
  }

  static async getById(id: string) {
    return await prisma.client.findUnique({
      where: { id }
    });
  }

  static async create(data: { name: string; identification: string; phone: string; email: string | null; address: string | null; }) {
    return await prisma.client.create({ data });
  }

  static async delete(id: string) {
    return await prisma.client.delete({ where: { id } });
  }

  static async update(id: string, data: { name: string; identification: string; phone: string; email: string | null; address: string | null; }) {
    return await prisma.client.update({ where: { id }, data });
  }
}
