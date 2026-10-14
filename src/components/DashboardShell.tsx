"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

interface DashboardShellProps {
  role: string;
  userName: string;
  userRoleLabel: string;
  notifications: any[];
  children: React.ReactNode;
}

export default function DashboardShell({
  role,
  userName,
  userRoleLabel,
  notifications,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Telón de fondo oscuro para móviles */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Barra lateral */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenedor principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Cabecera superior responsive */}
        <header className="dashboard-header">
          {/* Lado izquierdo: Botón hamburguesa y título para móviles */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú de navegación"
              title="Abrir menú"
            >
              ☰
            </button>
            <span
              className="mobile-only"
              style={{ fontWeight: 700, fontSize: "1.1rem", alignItems: "center", gap: "0.4rem" }}
            >
              <span style={{ color: "var(--accent-primary)" }}>⚙️</span> AutoPro
            </span>
          </div>

          {/* Lado derecho: Notificaciones y perfil */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <NotificationBell initialNotifications={notifications} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                {userName.charAt(0).toUpperCase() || "U"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }} className="desktop-only">
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{userName}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {userRoleLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <div className="dashboard-main-content">
          {children}
        </div>
      </main>
    </div>
  );
}
