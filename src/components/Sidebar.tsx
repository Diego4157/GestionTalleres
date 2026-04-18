"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/clientes", label: "Clientes", icon: "👥" },
    { href: "/dashboard/vehiculos", label: "Vehículos", icon: "🚗" },
    { href: "/dashboard/ordenes", label: "Órdenes de Servicio", icon: "📝" },
    { href: "/dashboard/inventario", label: "Inventario", icon: "⚙️" },
    { href: "/dashboard/citas", label: "Citas", icon: "📅" },
    { href: "/dashboard/facturas", label: "Facturas", icon: "💰" },
  ];

  return (
    <aside style={{
      width: "260px",
      backgroundColor: "var(--bg-secondary)",
      borderRight: "1px solid var(--border-color)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0
    }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
        <h2 className="h3" style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          <span style={{ color: "var(--accent-primary)" }}>⚙️</span> AutoPro
        </h2>
      </div>
      <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
        <ul style={{ listStyle: "none" }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1.5rem",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  borderRight: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                  transition: "var(--transition)",
                  fontWeight: isActive ? 600 : 400,
                }}>
                  <span style={{ fontSize: "1.25rem" }}>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border-color)" }}>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}>
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
