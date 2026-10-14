"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DiagnosticReportResult } from "@/lib/ai/diagnostic";
import { TipoVehiculo } from "@prisma/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText, sanitizeMileage, MAX_SHORT_TEXT_LENGTH, MAX_SYMPTOMS_LENGTH } from "@/lib/ai/input-guard";

export interface ClientBookingInput {
  client: {
    name: string;
    identification: string;
    phone: string;
    email?: string;
  };
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year?: number;
    mileage: number;
    tipo: "CARRO" | "MOTO";
  };
  appointment: {
    date: string; // ISO string
    reason: string;
    preDiagnosis?: DiagnosticReportResult;
  };
}

/**
 * Server Action pública para que los clientes agenden citas con pre-diagnóstico IA
 */
export async function createClientBooking(data: ClientBookingInput) {
  try {
    const { client: clientData, vehicle: vehicleData, appointment: appData } = data;

    if (!clientData.identification || !clientData.name || !clientData.phone) {
      return { success: false, error: "Nombre, identificación y teléfono son obligatorios." };
    }

    if (!vehicleData.plate || !vehicleData.brand || !vehicleData.model) {
      return { success: false, error: "Placa, marca y modelo del vehículo son obligatorios." };
    }

    if (!appData.date) {
      return { success: false, error: "Debe seleccionar una fecha y hora para la cita." };
    }

    // Protección del endpoint público: máximo 5 reservas por hora por IP.
    const limit = await rateLimit(`booking:ip:${await getClientIp()}`, 5, 3600);
    if (!limit.allowed) {
      return { success: false, error: "Has realizado demasiadas solicitudes. Intenta nuevamente más tarde." };
    }

    // Saneamiento y límites de longitud de los campos de texto libre.
    clientData.name = sanitizeText(clientData.name, 100);
    clientData.identification = sanitizeText(clientData.identification, 30);
    clientData.phone = sanitizeText(clientData.phone, 20);
    clientData.email = sanitizeText(clientData.email, 100);
    vehicleData.plate = sanitizeText(vehicleData.plate, 10);
    vehicleData.brand = sanitizeText(vehicleData.brand, MAX_SHORT_TEXT_LENGTH);
    vehicleData.model = sanitizeText(vehicleData.model, MAX_SHORT_TEXT_LENGTH);
    vehicleData.mileage = sanitizeMileage(vehicleData.mileage);
    appData.reason = sanitizeText(appData.reason, MAX_SYMPTOMS_LENGTH);

    if (Number.isNaN(new Date(appData.date).getTime())) {
      return { success: false, error: "La fecha de la cita no es válida." };
    }

    const cleanPlate = vehicleData.plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert o búsqueda de Cliente
      let client = await tx.client.findUnique({
        where: { identification: clientData.identification.trim() },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            name: clientData.name.trim(),
            identification: clientData.identification.trim(),
            phone: clientData.phone.trim(),
            email: clientData.email?.trim() || null,
          },
        });
      } else {
        // Actualizar teléfono o correo si cambiaron
        client = await tx.client.update({
          where: { id: client.id },
          data: {
            name: clientData.name.trim(),
            phone: clientData.phone.trim(),
            email: clientData.email?.trim() || client.email,
          },
        });
      }

      // 2. Upsert o búsqueda de Vehículo
      let vehicle = await tx.vehicle.findUnique({
        where: { plate: cleanPlate },
      });

      const tipoEnum = vehicleData.tipo === "MOTO" ? TipoVehiculo.MOTO : TipoVehiculo.CARRO;
      const currentYear = vehicleData.year ? Number(vehicleData.year) : new Date().getFullYear();

      if (!vehicle) {
        vehicle = await tx.vehicle.create({
          data: {
            plate: cleanPlate,
            brand: vehicleData.brand.trim(),
            model: vehicleData.model.trim(),
            year: currentYear,
            mileage: Number(vehicleData.mileage) || 0,
            tipo: tipoEnum,
            clientId: client.id,
          },
        });
      } else {
        // Actualizar kilometraje y tipo
        vehicle = await tx.vehicle.update({
          where: { id: vehicle.id },
          data: {
            brand: vehicleData.brand.trim() || vehicle.brand,
            model: vehicleData.model.trim() || vehicle.model,
            mileage: Number(vehicleData.mileage) > 0 ? Number(vehicleData.mileage) : vehicle.mileage,
            tipo: tipoEnum,
            clientId: client.id,
          },
        });
      }

      // 3. Crear Cita con Pre-diagnóstico
      const appointment = await tx.appointment.create({
        data: {
          date: new Date(appData.date),
          status: "PENDIENTE",
          reason: appData.reason.trim(),
          preDiagnosis: (appData.preDiagnosis as any) || null,
          clientId: client.id,
          vehicleId: vehicle.id,
        },
        include: {
          client: true,
          vehicle: true,
        },
      });

      return appointment;
    });

    revalidatePath("/dashboard/citas");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error al registrar reserva de cliente:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar la reserva. Por favor intenta de nuevo.",
    };
  }
}
