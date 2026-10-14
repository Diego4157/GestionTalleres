"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

const ROLES = ["ADMIN", "RECEPTIONIST", "MECHANIC"] as const;
type RoleValue = (typeof ROLES)[number];

const isRole = (v: string): v is RoleValue => (ROLES as readonly string[]).includes(v);

export async function getMechanics() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

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

export async function getUsers() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    return {
      success: true,
      data: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
    };
  } catch (error) {
    return { success: false, error: "Error al cargar usuarios." };
  }
}

export async function createUser(input: { name: string; email: string; password: string; role: string }) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email || !input.password) return { success: false, error: "Todos los campos son obligatorios." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { success: false, error: "Correo electrónico inválido." };
  if (input.password.length < 6) return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
  if (!isRole(input.role)) return { success: false, error: "Rol inválido." };

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { success: false, error: "Ya existe un usuario con ese correo." };

    const passwordHash = await bcrypt.hash(input.password, 10);
    await prisma.user.create({ data: { name, email, passwordHash, role: input.role } });
    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear usuario." };
  }
}

export async function updateUserRole(userId: string, role: string) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };
  if (!isRole(role)) return { success: false, error: "Rol inválido." };
  if (guard.userId === userId) return { success: false, error: "No puedes cambiar tu propio rol." };

  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar el rol." };
  }
}

export async function toggleUserActive(userId: string) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };
  if (guard.userId === userId) return { success: false, error: "No puedes desactivar tu propia cuenta." };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
    if (!user) return { success: false, error: "Usuario no encontrado." };
    await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar el usuario." };
  }
}
