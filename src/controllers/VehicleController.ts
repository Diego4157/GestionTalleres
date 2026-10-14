"use server";

import { VehicleDAO } from "@/models/dao/VehicleDAO";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";

type VehicleInput = { plate: string; brand: string; model: string; year: number; mileage: number; vin?: string | null; clientId: string; tipo: any };

export async function getVehicles() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const vehicles = await VehicleDAO.getAll();
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, error: "Error al cargar los vehículos." };
  }
}

export async function createVehicle(data: VehicleInput) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

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
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await VehicleDAO.delete(id);
    revalidatePath("/dashboard/vehiculos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar el vehículo." };
  }
}

export async function updateVehicle(id: string, data: VehicleInput) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const updatedVehicle = await VehicleDAO.update(id, data);
    revalidatePath("/dashboard/vehiculos");
    return { success: true, data: updatedVehicle };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un vehículo con esa placa." };
    return { success: false, error: "Error al actualizar el vehículo." };
  }
}
