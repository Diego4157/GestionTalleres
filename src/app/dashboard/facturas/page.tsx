import { getInvoices } from "@/app/actions/invoice";
import InvoiceManager from "./InvoiceManager";

export default async function FacturasPage() {
  const result = await getInvoices();
  const initialInvoices = result.success && result.data ? result.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Facturación</h1>
      </div>
      <InvoiceManager initialInvoices={initialInvoices as any} />
    </div>
  );
}
