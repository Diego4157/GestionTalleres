import { getUsers } from "@/app/actions/user";
import { requireRole } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import UserManager from "./UserManager";

export default async function UsuariosPage() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) redirect("/dashboard/ordenes");

  const result = await getUsers();
  const users = result.success && result.data ? result.data : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="h2">Gestión de Usuarios</h1>
      </div>
      <UserManager initialUsers={users} currentUserId={guard.userId} />
    </div>
  );
}
