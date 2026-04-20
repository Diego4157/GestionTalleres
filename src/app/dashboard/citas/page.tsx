import { getAppointments } from "@/app/actions/appointment";
import { getClients } from "@/app/actions/client";
import { getVehicles } from "@/app/actions/vehicle";
import { getMechanics } from "@/app/actions/user";
import AppointmentManager from "./AppointmentManager";

export default async function CitasPage() {
  const [appointmentsRes, clientsRes, vehiclesRes, mechanicsRes] = await Promise.all([
    getAppointments(), getClients(), getVehicles(), getMechanics(),
  ]);

  const initialAppointments = appointmentsRes.success && appointmentsRes.data ? appointmentsRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const vehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : [];
  const mechanics = mechanicsRes.success && mechanicsRes.data ? mechanicsRes.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Agenda de Citas</h1>
      </div>
      <AppointmentManager initialAppointments={initialAppointments as any} clients={clients} vehicles={vehicles} mechanics={mechanics} />
    </div>
  );
}
