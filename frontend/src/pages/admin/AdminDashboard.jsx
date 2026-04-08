import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetStats } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Users",        value: stats?.totalUsers,       icon: "👥", color: "#818cf8", bg: "#1e1b4b", path: null },
    { label: "Active Jobs",        value: stats?.totalJobs,        icon: "💼", color: "#34d399", bg: "#052e16", path: "/admin/jobs" },
    { label: "Resume Submissions", value: stats?.totalSubmissions, icon: "📄", color: "#fbbf24", bg: "#2d1f00", path: "/admin/resumes" },
    { label: "Feedbacks",          value: stats?.totalFeedbacks,   icon: "💬", color: "#f87171", bg: "#2d1515", path: "/admin/feedback" },
  ];

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.hero}>
          <h1 style={s.heroTitle}>Admin Dashboard</h1>
          <p style={s.heroSub}>Manage jobs, view resumes and monitor feedback</p>
          <button style={s.heroBtn} onClick={() => navigate("/admin/jobs")}>+ Post New Job</button>
        </div>
        <div style={s.grid}>
          {cards.map(c => (
            <div key={c.label} style={{ ...s.card, cursor: c.path ? "pointer" : "default" }} onClick={() => c.path && navigate(c.path)}>
              <div style={{ ...s.iconBox, background: c.bg }}><span style={{ fontSize: 24 }}>{c.icon}</span></div>
              <div style={{ ...s.cardVal, color: c.color }}>{loading ? "—" : c.value}</div>
              <div style={s.cardLabel}>{c.label}</div>
              {c.path && <div style={{ ...s.cardArrow, color: c.color }}>View →</div>}
            </div>
          ))}
        </div>
        <div style={s.quickLinks}>
          <h2 style={s.qlTitle}>Quick Actions</h2>
          <div style={s.qlGrid}>
            {[
              { label: "Post a New Job",   desc: "Create job listing and alert all users", path: "/admin/jobs",     color: "#818cf8" },
              { label: "View All Resumes", desc: "See all submitted resumes and scores",    path: "/admin/resumes",  color: "#34d399" },
              { label: "View Feedback",    desc: "Read user feedback and ratings",          path: "/admin/feedback", color: "#fbbf24" },
            ].map(q => (
              <div key={q.label} style={s.qlCard} onClick={() => navigate(q.path)}>
                <div style={{ ...s.qlDot, background: q.color }} />
                <div>
                  <div style={s.qlLabel}>{q.label}</div>
                  <div style={s.qlDesc}>{q.desc}</div>
                </div>
                <span style={{ ...s.qlArrow, color: q.color }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1000, margin: "auto", padding: "28px 20px 60px" },
  hero: { background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 16, padding: "28px 32px", marginBottom: 24, border: "1px solid #4f46e5" },
  heroTitle: { fontSize: 24, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 },
  heroSub: { fontSize: 14, color: "#a5b4fc", marginBottom: 20 },
  heroBtn: { background: "linear-gradient(135deg,#4f46e5,#818cf8)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 },
  card: { background: "#13131f", borderRadius: 14, border: "1px solid #2d2d4e", padding: "20px 22px" },
  iconBox: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  cardVal: { fontSize: 32, fontWeight: 800, marginBottom: 4 },
  cardLabel: { fontSize: 13, color: "#64748b" },
  cardArrow: { fontSize: 12, fontWeight: 600, marginTop: 8 },
  quickLinks: {},
  qlTitle: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 },
  qlGrid: { display: "flex", flexDirection: "column", gap: 10 },
  qlCard: { background: "#13131f", borderRadius: 12, border: "1px solid #2d2d4e", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" },
  qlDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  qlLabel: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 },
  qlDesc: { fontSize: 12, color: "#64748b" },
  qlArrow: { marginLeft: "auto", fontSize: 18, fontWeight: 700 },
};
