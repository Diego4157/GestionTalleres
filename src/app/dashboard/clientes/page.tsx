import { getClients } from "@/controllers/ClienteController";
import ClientesView from "@/views/ClientesView";

export default async function ClientesPage() {
  const result = await getClients();
  const initialClients = result.success && result.data ? result.data : [];

  return <ClientesView initialClients={initialClients as any} />;
}
