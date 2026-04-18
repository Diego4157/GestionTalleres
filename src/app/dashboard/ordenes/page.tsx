import { getOrders } from "@/app/actions/order";
import { getClients } from "@/app/actions/client";
import { getVehicles } from "@/app/actions/vehicle";
import { getMechanics } from "@/app/actions/user";
import OrderManager from "./OrderManager";

export default async function OrdenesPage() {
  const [ordersRes, clientsRes, vehiclesRes, mechanicsRes] = await Promise.all([
    getOrders(), getClients(), getVehicles(), getMechanics(),
  ]);

  const initialOrders = ordersRes.success && ordersRes.data ? ordersRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const vehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : [];
  const mechanics = mechanicsRes.success && mechanicsRes.data ? mechanicsRes.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Órdenes de Servicio</h1>
      </div>
      <OrderManager initialOrders={initialOrders as any} clients={clients} vehicles={vehicles} mechanics={mechanics} />
    </div>
  );
}
