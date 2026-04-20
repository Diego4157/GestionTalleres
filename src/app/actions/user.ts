"use server";

import { prisma } from "@/lib/prisma";

export async function getMechanics() {
  try {
    const mechanics = await prisma.user.findMany({
      where: { role: "MECHANIC", isActive: true },
      select: { id: true, name: true },
    });
    return { success: true, data: mechanics };
  } catch (error) {
    return { success: false, error: "Error al cargar mecánicos." };
  }
}
