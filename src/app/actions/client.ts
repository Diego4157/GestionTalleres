"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { vehicles: true, orders: true } }
      }
    });
    return { success: true, data: clients };
  } catch (error) {
    return { success: false, error: "Error al cargar los clientes." };
  }
}

export async function createClient(data: { name: string; identification: string; phone: string; email: string; address: string; }) {
  try {
    const newClient = await prisma.client.create({
      data: {
        name: data.name,
        identification: data.identification,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
      }
    });
    revalidatePath("/dashboard/clientes");
    return { success: true, data: newClient };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un cliente con esa identificación o correo." };
    return { success: false, error: "Error al crear el cliente." };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar el cliente, tiene registros asociados." };
  }
}
