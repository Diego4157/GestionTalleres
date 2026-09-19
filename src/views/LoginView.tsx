"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        Swal.fire({
          title: 'Error de acceso',
          text: 'Credenciales inválidas. Por favor intente de nuevo.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        setError("Credenciales inválidas.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error inesperado.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="centered-layout">
      <div className="glass-panel animate-fade-in" style={{ padding: "3rem 2rem", maxWidth: "450px", width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ 
            width: "64px", height: "64px", borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto", boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "white" }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
        </div>
        <h1 className="h2">AutoPro</h1>
        <p className="text-muted" style={{ marginBottom: "2rem" }}>Gestión Inteligente de Talleres</p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          {error && (
            <div style={{ 
              backgroundColor: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid var(--danger)", 
              color: "var(--danger)", 
              padding: "0.75rem", 
              borderRadius: "0.5rem", 
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="admin@taller.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Ingresar"}
          </button>
          
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={async () => {
                const { value: emailToRecover } = await Swal.fire({
                  title: 'Recuperar Contraseña',
                  input: 'email',
                  inputLabel: 'Ingresa tu correo electrónico',
                  inputPlaceholder: 'admin@taller.com',
                  showCancelButton: true,
                  confirmButtonText: 'Enviar',
                  cancelButtonText: 'Cancelar'
                });

                if (emailToRecover) {
                  Swal.fire({
                    title: '¡Enviado!',
                    text: `Se han enviado las instrucciones de recuperación a: ${emailToRecover}`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                  });
                }
              }}
              style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", textDecoration: "underline", fontSize: "0.875rem" }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
