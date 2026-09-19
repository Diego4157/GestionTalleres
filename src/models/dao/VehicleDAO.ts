import { prisma } from "@/lib/prisma";

export class VehicleDAO {
  static async getAll() {
    return await prisma.vehicle.findMany({
      orderBy: { plate: "asc" },
      include: { client: true }
    });
  }

  static async create(data: { plate: string; brand: string; model: string; year: number; mileage: number; vin?: string | null; clientId: string; }) {
    return await prisma.vehicle.create({ data });
  }

  static async delete(id: string) {
    return await prisma.vehicle.delete({ where: { id } });
  }

  static async update(id: string, data: { plate: string; brand: string; model: string; year: number; mileage: number; vin?: string | null; clientId: string; }) {
    return await prisma.vehicle.update({ where: { id }, data });
  }
}
