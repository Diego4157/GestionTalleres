"use server";

import { UserDAO } from "@/models/dao/UserDAO";

export async function getMechanics() {
  try {
    const mechanics = await UserDAO.getMechanics();
    return { success: true, data: mechanics };
  } catch (error) {
    return { success: false, error: "Error al cargar mecánicos." };
  }
}
