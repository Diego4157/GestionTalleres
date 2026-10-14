"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";
import { DiagnosticReportResult } from "@/lib/ai/diagnostic";
import { sendWhatsAppNotification } from "@/lib/notifications";

export async function getAppointments() {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: "asc" },
      include: { client: true, vehicle: true, mechanic: true },
    });
    return { success: true, data: appointments };
  } catch (error) {
    return { success: false, error: "Error al cargar las citas." };
  }
}

export async function createAppointment(data: { date: Date; clientId: string; vehicleId?: string; mechanicId?: string; reason?: string; preDiagnosis?: any }) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const newAppointment = await prisma.appointment.create({
      data: {
        date: data.date,
        clientId: data.clientId,
        vehicleId: data.vehicleId || null,
        mechanicId: data.mechanicId || null,
        reason: data.reason || null,
        preDiagnosis: data.preDiagnosis || undefined,
        status: "PENDIENTE",
      },
    });
    revalidatePath("/dashboard/citas");
    return { success: true, data: newAppointment };
  } catch (error) {
    return { success: false, error: "Error al programar cita." };
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/citas");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar cita." };
  }
}

export async function updateAppointment(id: string, data: { date: Date; clientId: string; vehicleId?: string; mechanicId?: string; reason?: string; preDiagnosis?: any }) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: data.date,
        clientId: data.clientId,
        vehicleId: data.vehicleId || null,
        mechanicId: data.mechanicId || null,
        reason: data.reason !== undefined ? data.reason : undefined,
        preDiagnosis: data.preDiagnosis !== undefined ? data.preDiagnosis : undefined,
      },
    });
    revalidatePath("/dashboard/citas");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar cita." };
  }
}

export async function deleteAppointment(id: string) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await prisma.appointment.delete({ where: { id } });
    revalidatePath("/dashboard/citas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar cita." };
  }
}

/**
 * Convierte una cita en una Orden de Trabajo vinculada, precargando el motivo
 * y el pre-diagnóstico IA como contexto técnico para el mecánico.
 */
export async function createOrderFromAppointment(appointmentId: string) {
  const guard = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true, vehicle: true },
    });

    if (!appointment) return { success: false, error: "Cita no encontrada." };
    if (!appointment.vehicleId || !appointment.vehicle) {
      return { success: false, error: "La cita no tiene un vehículo asociado. Edítala y asigna uno antes de crear la orden." };
    }
    if (appointment.status === "COMPLETADA") {
      return { success: false, error: "Esta cita ya fue convertida en una orden de trabajo." };
    }
    if (appointment.status === "CANCELADA") {
      return { success: false, error: "No se puede crear una orden desde una cita cancelada." };
    }

    const ai = appointment.preDiagnosis as unknown as DiagnosticReportResult | null;
    const lines: string[] = [];
    if (appointment.reason) lines.push(`[MOTIVO REPORTADO POR EL CLIENTE]\n${appointment.reason}`);
    if (ai && ai.diagnostico_preliminar) {
      const sistemas = (ai.sistemas_a_inspeccionar || []).map((s) => `• ${s}`).join("\n");
      const repuestos = (ai.repuestos_sugeridos || []).map((r) => `• ${r}`).join("\n");
      lines.push(
        `[PRE-DIAGNÓSTICO IA - Prioridad: ${ai.nivel_prioridad}]\n${ai.diagnostico_preliminar}\n\nSISTEMAS A INSPECCIONAR:\n${sistemas}\n\nREPUESTOS ESTIMADOS:\n${repuestos}`
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          clientId: appointment.clientId,
          vehicleId: appointment.vehicleId as string,
          mechanicId: appointment.mechanicId,
          status: "REGISTRADA",
          diagnosis: lines.length > 0 ? lines.join("\n\n") : null,
          preDiagnosis: appointment.preDiagnosis
            ? (appointment.preDiagnosis as Prisma.InputJsonValue)
            : undefined,
        },
      });
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETADA" },
      });
      return created;
    });

    await sendWhatsAppNotification(
      appointment.client.phone,
      `Hola ${appointment.client.name}, recibimos tu vehículo ${appointment.vehicle.plate}. Orden de servicio #${order.id.slice(0, 8)} registrada.`
    );

    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/ordenes");
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: "Error al crear la orden desde la cita." };
  }
}
