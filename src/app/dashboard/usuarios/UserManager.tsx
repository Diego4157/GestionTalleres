"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { createUser, updateUserRole, toggleUserActive } from "@/app/actions/user";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  MECHANIC: "Mecánico",
};

export default function UserManager({ initialUsers, currentUserId }: { initialUsers: UserRow[]; currentUserId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MECHANIC" });
  const [busy, setBusy] = useState(false);

  const reload = () => window.location.reload();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await createUser(form);
    setBusy(false);
    if (res.success) {
      setIsModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "MECHANIC" });
      Swal.fire("¡Éxito!", "Empleado registrado correctamente", "success").then(reload);
    } else {
      Swal.fire("Error", res.error || "No se pudo crear el usuario", "error");
    }
  };

  const handleRole = async (id: string, role: string) => {
    const res = await updateUserRole(id, role);
    if (res.success) {
      Swal.fire("Actualizado", "Rol modificado", "success").then(reload);
    } else {
      Swal.fire("Error", res.error || "No se pudo cambiar el rol", "error").then(reload);
    }
  };

  const handleToggle = async (id: string) => {
    const res = await toggleUserActive(id);
    if (res.success) reload();
    else Swal.fire("Error", res.error || "No se pudo actualizar el usuario", "error");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nuevo Empleado</button>
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Nombre</th>
              <th style={{ padding: "1rem" }}>Correo</th>
              <th style={{ padding: "1rem" }}>Rol</th>
              <th style={{ padding: "1rem" }}>Estado</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1rem" }}>{u.name}{isSelf && " (tú)"}</td>
                  <td style={{ padding: "1rem" }}>{u.email}</td>
                  <td style={{ padding: "1rem" }}>
                    <select
                      className="form-input"
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => handleRole(u.id, e.target.value)}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: u.isActive ? "var(--success)" : "var(--danger)",
                      color: "#fff",
                    }}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <button className="btn btn-secondary" disabled={isSelf} onClick={() => handleToggle(u.id)}>
                      {u.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "450px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="h3">Nuevo Empleado</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input type="email" className="form-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña (mín. 6 caracteres)</label>
                <input type="password" minLength={6} className="form-input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
