"use server";

import { VehicleDAO } from "@/models/dao/VehicleDAO";
import { revalidatePath } from "next/cache";

export async function getVehicles() {
  try {
    const vehicles = await VehicleDAO.getAll();
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, error: "Error al cargar los vehículos." };
  }
}

export async function createVehicle(data: { plate: string; brand: string; model: string; year: number; mileage: number; vin?: string | null; clientId: string; }) {
  try {
    const newVehicle = await VehicleDAO.create(data);
    revalidatePath("/dashboard/vehiculos");
    return { success: true, data: newVehicle };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un vehículo con esa placa." };
    return { success: false, error: "Error al crear el vehículo." };
  }
}

export async function deleteVehicle(id: string) {
  try {
    await VehicleDAO.delete(id);
    revalidatePath("/dashboard/vehiculos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar el vehículo." };
  }
}

export async function updateVehicle(id: string, data: { plate: string; brand: string; model: string; year: number; mileage: number; vin?: string | null; clientId: string; }) {
  try {
    const updatedVehicle = await VehicleDAO.update(id, data);
    revalidatePath("/dashboard/vehiculos");
    return { success: true, data: updatedVehicle };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un vehículo con esa placa." };
    return { success: false, error: "Error al actualizar el vehículo." };
  }
}
