import { getInventory } from "@/app/actions/inventory";
import InventoryManager from "./InventoryManager";

export default async function InventarioPage() {
  const result = await getInventory();
  const initialInventory = result.success && result.data ? result.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Gestión de Inventario</h1>
      </div>
      <InventoryManager initialInventory={initialInventory as any} />
    </div>
  );
}
