import LoginForm from "@/components/LoginForm";

export default function Home() {
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
        <LoginForm />
      </div>
    </div>
  );
}
