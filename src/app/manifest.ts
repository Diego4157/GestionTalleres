import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AutoPro - Gestión Inteligente de Talleres",
    short_name: "AutoPro",
    description: "Sistema inteligente para la gestión de talleres mecánicos con diagnóstico asistido por IA",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "es",
    categories: ["business", "productivity", "automotive"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Reservar cita", short_name: "Reservar", url: "/reservar", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Órdenes de servicio", short_name: "Órdenes", url: "/dashboard/ordenes", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
