import { getVehicles } from "@/app/actions/vehicle";
import { getClients } from "@/app/actions/client";
import VehicleManager from "./VehicleManager";

export default async function VehiculosPage() {
  const [vehiclesRes, clientsRes] = await Promise.all([getVehicles(), getClients()]);
  const initialVehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Gestión de Vehículos</h1>
      </div>
      <VehicleManager initialVehicles={initialVehicles as any} clients={clients} />
    </div>
  );
}
