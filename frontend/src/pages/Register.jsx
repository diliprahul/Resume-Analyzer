import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ username: "", email: "", password: "", confirm: "", contactNo: "", address: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError("Username, email and password required"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      setLoading(true); setError("");
      const data = await registerUser({ username: form.username, email: form.email, password: form.password, contactNo: form.contactNo, address: form.address });
      login({ username: data.username, email: data.email, role: data.role }, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  const f = (key) => ({
    style: s.input,
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value })
  });

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
        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Start analyzing your resume today</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Username *</label>
              <input placeholder="johndoe" {...f("username")} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Email *</label>
              <input type="email" placeholder="john@example.com" {...f("email")} />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Password *</label>
              <input type="password" placeholder="Min 6 chars" {...f("password")} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Confirm Password *</label>
              <input type="password" placeholder="Repeat password" {...f("confirm")} />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Phone</label>
              <input placeholder="9876543210" {...f("contactNo")} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Address</label>
              <input placeholder="City, State" {...f("address")} />
            </div>
          </div>
          <button style={s.btn} disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", padding: 24 },
  card: { width: "100%", maxWidth: 520, background: "#13131f", borderRadius: 20, boxShadow: "0 20px 60px rgba(79,70,229,0.25)", border: "1px solid #2d2d4e", padding: "36px 32px 28px" },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: 700, color: "#818cf8" },
  title: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  err: { background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 0 },
  group: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 },
  input: { width: "100%", padding: "11px 13px", fontSize: 13, borderRadius: 10, border: "1.5px solid #2d2d4e", outline: "none", color: "#f1f5f9", background: "#1a1a2e" },
  btn: { width: "100%", padding: 13, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#4f46e5,#818cf8)", cursor: "pointer", marginTop: 4 },
  footer: { textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" },
  link: { color: "#818cf8", fontWeight: 600, textDecoration: "none" },
};
