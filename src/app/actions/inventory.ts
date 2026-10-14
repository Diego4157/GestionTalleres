"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";

type InventoryInput = { code: string; description: string; currentStock: number; minStock: number; purchasePrice: number; salePrice: number; };

export async function getInventory() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { description: "asc" }
    });
    const enrichedInventory = inventory.map(item => {
      let ropStatus = "ÓPTIMO";
      if (item.currentStock <= item.minStock / 2) {
        ropStatus = "CRÍTICO";
      } else if (item.currentStock <= item.minStock) {
        ropStatus = "ALERTA DE REORDEN";
      }
      return { ...item, ropStatus };
    });
    return { success: true, data: enrichedInventory };
  } catch (error) {
    return { success: false, error: "Error al cargar el inventario." };
  }
}

export async function createInventoryItem(data: InventoryInput) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

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
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

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

export async function updateInventoryItem(id: string, data: InventoryInput) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const updated = await prisma.inventory.update({
      where: { id },
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
    return { success: true, data: updated };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Ya existe un producto con ese código." };
    return { success: false, error: "Error al actualizar el producto." };
  }
}

export async function deleteInventoryItem(id: string) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await prisma.inventory.delete({ where: { id } });
    revalidatePath("/dashboard/inventario");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar el producto, tiene registros asociados." };
  }
}
