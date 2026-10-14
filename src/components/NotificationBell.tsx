"use client";

import { useState } from "react";
import { type Notification } from "@/lib/notifications";

export default function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          background: "transparent", 
          border: "none", 
          cursor: "pointer", 
          position: "relative",
          fontSize: "1.5rem"
        }}
      >
        🔔
        {initialNotifications.length > 0 && (
          <span style={{ 
            position: "absolute", top: -5, right: -5, 
            background: "var(--danger)", color: "white", 
            borderRadius: "50%", width: "18px", height: "18px", 
            fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {initialNotifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-panel" style={{ 
          position: "absolute", top: "100%", right: 0, 
          width: "350px", maxHeight: "400px", overflowY: "auto", 
          marginTop: "0.5rem", zIndex: 50, padding: "1rem" 
        }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>Notificaciones Recientes</h3>
          {initialNotifications.length === 0 ? (
            <p className="text-muted" style={{ fontSize: "0.875rem" }}>No hay notificaciones.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {initialNotifications.map(n => (
                <div key={n.id} style={{ padding: "0.5rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                  <p style={{ fontSize: "0.875rem" }}>{n.message}</p>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{new Date(n.date).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
