"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

export async function getAppointments() {
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

export async function createAppointment(data: { date: Date; clientId: string; vehicleId?: string; mechanicId?: string }) {
  try {
    const newAppointment = await prisma.appointment.create({
      data: {
        date: data.date,
        clientId: data.clientId,
        vehicleId: data.vehicleId || null,
        mechanicId: data.mechanicId || null,
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
