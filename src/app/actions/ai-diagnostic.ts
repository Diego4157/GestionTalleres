"use server";

import { analyzeWithGemini, DiagnosticInput, DiagnosticReportResult } from "@/lib/ai/diagnostic";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  sanitizeText,
  sanitizeMileage,
  MIN_SYMPTOMS_LENGTH,
  MAX_SYMPTOMS_LENGTH,
  MAX_SHORT_TEXT_LENGTH,
} from "@/lib/ai/input-guard";

/**
 * Server Action para ejecutar el análisis de diagnóstico con IA
 */
export async function analyzeDiagnosticReport(data: DiagnosticInput): Promise<{
  success: boolean;
  data?: DiagnosticReportResult;
  error?: string;
}> {
  try {
    const sintomas = sanitizeText(data?.sintomas_reportados, MAX_SYMPTOMS_LENGTH + 1);
    if (sintomas.length < MIN_SYMPTOMS_LENGTH) {
      return {
        success: false,
        error: `Por favor describe con mayor detalle los síntomas (mínimo ${MIN_SYMPTOMS_LENGTH} caracteres).`,
      };
    }
    if (sintomas.length > MAX_SYMPTOMS_LENGTH) {
      return {
        success: false,
        error: `La descripción es demasiado larga (máximo ${MAX_SYMPTOMS_LENGTH} caracteres).`,
      };
    }

    // Protección de la cuota de Gemini: más estricta para anónimos (portal público).
    const guard = await requireRole();
    const limit = guard.ok
      ? await rateLimit(`ai:user:${guard.userId}`, 30, 600)
      : await rateLimit(`ai:ip:${await getClientIp()}`, 5, 600);

    if (!limit.allowed) {
      return {
        success: false,
        error: `Has alcanzado el límite de análisis. Intenta de nuevo en ${Math.ceil(limit.retryAfterSec / 60)} minuto(s).`,
      };
    }

    const payload: DiagnosticInput = {
      tipoVehiculo: data.tipoVehiculo === "MOTO" ? "MOTO" : "CARRO",
      marca: sanitizeText(data.marca, MAX_SHORT_TEXT_LENGTH) || "Desconocida",
      modelo: sanitizeText(data.modelo, MAX_SHORT_TEXT_LENGTH) || "General",
      kilometraje: sanitizeMileage(data.kilometraje),
      sintomas_reportados: sintomas,
    };

    const report = await analyzeWithGemini(payload);
    return { success: true, data: report };
  } catch (error: any) {
    console.error("Error en analyzeDiagnosticReport action:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar el diagnóstico asistido con IA.",
    };
  }
}

/**
 * Server Action para asociar y persistir el diagnóstico de IA en una orden de servicio
 */
export async function saveAIDiagnosisToOrder(orderId: string, aiReport: DiagnosticReportResult, updateMainDiagnosis = true) {
  const guard = await requireRole();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      return { success: false, error: "Orden de servicio no encontrada." };
    }

    let updatedDiagnosisText = currentOrder.diagnosis || "";

    if (updateMainDiagnosis) {
      const sistemasTexto = aiReport.sistemas_a_inspeccionar.map((s) => `• ${s}`).join("\n");
      const repuestosTexto = aiReport.repuestos_sugeridos.map((r) => `• ${r}`).join("\n");

      const bloqueIA = `[DIAGNÓSTICO ASISTIDO IA (${aiReport.origen_motor || "IA"}) - Prioridad: ${aiReport.nivel_prioridad}]\n${aiReport.diagnostico_preliminar}\n\nSISTEMAS RECOMENDADOS:\n${sistemasTexto}\n\nREPUESTOS ESTIMADOS:\n${repuestosTexto}`;

      if (updatedDiagnosisText.trim()) {
        updatedDiagnosisText = `${updatedDiagnosisText}\n\n${bloqueIA}`;
      } else {
        updatedDiagnosisText = bloqueIA;
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        diagnosis: updatedDiagnosisText,
        preDiagnosis: aiReport as any,
      },
    });

    revalidatePath(`/dashboard/ordenes/${orderId}`);
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error al guardar diagnóstico IA en orden:", error);
    return { success: false, error: "No se pudo vincular el diagnóstico a la orden." };
  }
}
