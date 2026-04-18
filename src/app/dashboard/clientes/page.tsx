import { getClients } from "@/app/actions/client";
import ClientManager from "./ClientManager";

export default async function ClientesPage() {
  const result = await getClients();
  const initialClients = result.success && result.data ? result.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Gestión de Clientes</h1>
      </div>
      <ClientManager initialClients={initialClients as any} />
    </div>
  );
}
