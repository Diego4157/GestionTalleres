import Sidebar from "@/components/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ 
          height: "70px", 
          borderBottom: "1px solid var(--border-color)", 
          backgroundColor: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          padding: "0 2rem",
          justifyContent: "space-between"
        }}>
          <div></div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {session.user.name?.charAt(0) || "U"}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{session.user.name}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{session.user.role?.toLowerCase() || "Usuario"}</span>
            </div>
          </div>
        </header>
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
