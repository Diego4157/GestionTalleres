"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventory() {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { description: "asc" }
    });
    return { success: true, data: inventory };
  } catch (error) {
    return { success: false, error: "Error al cargar el inventario." };
  }
}

export async function createInventoryItem(data: { code: string; description: string; currentStock: number; minStock: number; purchasePrice: number; salePrice: number; }) {
  try {
    const newItem = await prisma.inventory.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        currentStock: Number(data.currentStock),
        minStock: Number(data.minStock),
        purchasePrice: Number(data.purchasePrice),
        salePrice: Number(data.salePrice),
      }
    });
    revalidatePath("/dashboard/inventario");
    return { success: true, data: newItem };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un producto con ese código." };
    return { success: false, error: "Error al registrar producto." };
  }
}

export async function updateStock(id: string, newStock: number) {
  try {
    const updated = await prisma.inventory.update({
      where: { id },
      data: { currentStock: Number(newStock) }
    });
    revalidatePath("/dashboard/inventario");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar stock." };
  }
}
