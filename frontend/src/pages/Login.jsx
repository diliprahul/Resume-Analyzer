import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ usernameOrEmail: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usernameOrEmail || !form.password) { setError("All fields required"); return; }
    try {
      setLoading(true); setError("");
      const data = await loginUser(form);
      login({ username: data.username, email: data.email, role: data.role }, data.token);
      navigate(data.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="white" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <span style={s.logoText}>ResumeAnalyzer</span>
        </div>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in with username or email</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.group}>
            <label style={s.label}>Username or Email</label>
            <input style={s.input} placeholder="john@example.com"
              value={form.usernameOrEmail}
              onChange={e => setForm({...form, usernameOrEmail: e.target.value})} />
          </div>
          <div style={s.group}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button style={s.btn} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={s.footer}>
          Don't have an account? <Link to="/register" style={s.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", padding: 24 },
  card: { width: "100%", maxWidth: 420, background: "#13131f", borderRadius: 20, boxShadow: "0 20px 60px rgba(79,70,229,0.2)", padding: "36px 32px 28px", border: "1px solid #2d2d4e" },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: 700, color: "#818cf8" },
  title: { fontSize: 24, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 28 },
  err: { background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16 },
  group: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 7 },
  input: { width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 12, border: "1.5px solid #2d2d4e", outline: "none", color: "#f1f5f9", background: "#1a1a2e" },
  btn: { width: "100%", padding: 13, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#4f46e5,#818cf8)", cursor: "pointer", marginTop: 4 },
  footer: { textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" },
  link: { color: "#818cf8", fontWeight: 600, textDecoration: "none" },
};
