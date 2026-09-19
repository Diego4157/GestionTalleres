import { getVehicles } from "@/controllers/VehicleController";
import { getClients } from "@/controllers/ClienteController";
import VehiculosView from "@/views/VehiculosView";

export default async function VehiculosPage() {
  const [vehiclesRes, clientsRes] = await Promise.all([
    getVehicles(),
    getClients(),
  ]);

  const initialVehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];

  return <VehiculosView initialVehicles={initialVehicles as any} clients={clients} />;
}
