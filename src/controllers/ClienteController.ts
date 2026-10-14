"use server";

import { ClienteDAO } from "@/models/dao/ClienteDAO";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";

type ClientInput = { name: string; identification: string; phone: string; email: string; address: string; };

export async function getClients() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const clients = await ClienteDAO.getAll();
    return { success: true, data: clients };
  } catch (error) {
    return { success: false, error: "Error al cargar los clientes." };
  }
}

export async function createClient(data: ClientInput) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const newClient = await ClienteDAO.create({
      name: data.name,
      identification: data.identification,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
    });
    revalidatePath("/dashboard/clientes");
    return { success: true, data: newClient };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un cliente con esa identificación o correo." };
    return { success: false, error: "Error al crear el cliente." };
  }
}

export async function deleteClient(id: string) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await ClienteDAO.delete(id);
    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar el cliente, tiene registros asociados." };
  }
}

export async function updateClient(id: string, data: ClientInput) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const updatedClient = await ClienteDAO.update(id, {
      name: data.name,
      identification: data.identification,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
    });
    revalidatePath("/dashboard/clientes");
    return { success: true, data: updatedClient };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un cliente con esa identificación o correo." };
    return { success: false, error: "Error al actualizar el cliente." };
  }
}
