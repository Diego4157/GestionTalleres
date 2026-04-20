"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
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
        setError("Credenciales inválidas. Por favor intente de nuevo.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
    </form>
  );
}
