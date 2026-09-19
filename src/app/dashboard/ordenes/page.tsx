import { getOrders } from "@/controllers/OrdenController";
import { getClients } from "@/controllers/ClienteController";
import { getVehicles } from "@/controllers/VehicleController";
import { getMechanics } from "@/controllers/UserController";
import OrdenesView from "@/views/OrdenesView";

export default async function OrdenesPage() {
  const [ordersRes, clientsRes, vehiclesRes, mechanicsRes] = await Promise.all([
    getOrders(), getClients(), getVehicles(), getMechanics(),
  ]);

  const initialOrders = ordersRes.success && ordersRes.data ? ordersRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const vehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : [];
  const mechanics = mechanicsRes.success && mechanicsRes.data ? mechanicsRes.data : [];

  return (
    <OrdenesView 
      initialOrders={initialOrders as any} 
      clients={clients} 
      vehicles={vehicles} 
      mechanics={mechanics} 
    />
  );
}
