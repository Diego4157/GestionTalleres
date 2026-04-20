"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, identification: true } },
        _count: { select: { orders: true } }
      }
    });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, error: "Error al cargar los vehículos." };
  }
}

export async function createVehicle(data: { plate: string; brand: string; model: string; year: number; mileage: number; vin: string; clientId: string; }) {
  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        plate: data.plate.toUpperCase(),
        brand: data.brand,
        model: data.model,
        year: Number(data.year),
        mileage: Number(data.mileage),
        vin: data.vin || null,
        clientId: data.clientId,
      },
      include: {
        client: { select: { name: true, identification: true } },
        _count: { select: { orders: true } }
      }
    });
    revalidatePath("/dashboard/vehiculos");
    return { success: true, data: newVehicle };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un vehículo con esa placa." };
    return { success: false, error: "Error al registrar el vehículo." };
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({ where: { id } });
    revalidatePath("/dashboard/vehiculos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar el vehículo." };
  }
}
