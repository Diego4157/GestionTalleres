import { auth } from "@/auth";

export type AppRole = "ADMIN" | "RECEPTIONIST" | "MECHANIC";

export type GuardResult =
  | { ok: true; userId: string; role: AppRole }
  | { ok: false; error: string };

/**
 * Valida en el servidor la sesión y el rol del usuario antes de ejecutar una mutación.
 * Si `allowed` se omite, solo exige estar autenticado.
 */
export async function requireRole(allowed?: AppRole[]): Promise<GuardResult> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return { ok: false, error: "Sesión no válida. Inicia sesión nuevamente." };
  }

  const role = user.role as AppRole;
  if (allowed && !allowed.includes(role)) {
    return { ok: false, error: "Acceso denegado: privilegios insuficientes para esta operación." };
  }

  return { ok: true, userId: user.id, role };
}
