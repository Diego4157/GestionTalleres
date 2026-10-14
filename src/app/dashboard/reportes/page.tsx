import { getReport } from "@/app/actions/reports";
import { requireRole } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import ReportsManager from "./ReportsManager";

export default async function ReportesPage() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) redirect("/dashboard/ordenes");

  const result = await getReport();

  return (
    <div className="animate-fade-in">
      <div className="no-print" style={{ marginBottom: "2rem" }}>
        <h1 className="h2">Reportes</h1>
      </div>
      <ReportsManager initialReport={result.success ? result.data : null} initialError={result.success ? null : result.error} />
    </div>
  );
}
