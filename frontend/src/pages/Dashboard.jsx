import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getJobs, getMyResumes, getNotifications } from "../api/client";
import Navbar from "../components/Navbar";

const scoreColor = (s) => s >= 70 ? "#34d399" : s >= 50 ? "#fbbf24" : "#f87171";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [resumes, setResumes] = useState([]);
  const [notifs, setNotifs]   = useState({ unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    Promise.all([
      getJobs().catch(() => []),
      getMyResumes().catch(() => []),
      getNotifications().catch(() => ({ unreadCount: 0, notifications: [] })),
    ]).then(([j, r, n]) => {
      setJobs(Array.isArray(j) ? j : []);
      setResumes(Array.isArray(r) ? r : []);
      setNotifs(n || { unreadCount: 0 });
    }).catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + (r.totalScore || 0), 0) / resumes.length) : 0;
  const bestScore = resumes.length
    ? Math.round(Math.max(...resumes.map(r => r.totalScore || 0))) : 0;

  const stats = [
    { label: "Active Jobs",       value: jobs.length,       color: "#818cf8", icon: "💼" },
    { label: "Submitted",         value: resumes.length,    color: "#34d399", icon: "📄" },
    { label: "Avg ATS Score",     value: avgScore + "%",    color: "#fbbf24", icon: "📊" },
    { label: "Best Score",        value: bestScore + "%",   color: "#f87171", icon: "🏆" },
    { label: "Notifications",     value: notifs.unreadCount,color: "#a78bfa", icon: "🔔" },
  ];

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>

        {/* Hero */}
        <div style={s.hero}>
          <div>
            <h1 style={s.heroTitle}>Welcome back, {user?.username}! 👋</h1>
            <p style={s.heroSub}>Your ATS resume analyzer — check scores, apply to jobs, track results.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={s.heroBtn} onClick={() => navigate("/analyze")}>🎯 Free ATS Check</button>
            <button style={{ ...s.heroBtn, background: "#1e1b4b", color: "#818cf8" }} onClick={() => navigate("/jobs")}>Browse Jobs →</button>
          </div>
        </div>

        {error && <div style={s.err}>{error}</div>}

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(stat => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statIcon}>{stat.icon}</div>
              <div style={{ ...s.statVal, color: stat.color }}>{loading ? "—" : stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={s.twoCol}>
          {/* Recent Jobs */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <h2 style={s.cardTitle}>📋 Recent Jobs</h2>
              <button style={s.seeAll} onClick={() => navigate("/jobs")}>See all →</button>
            </div>
            {loading ? <p style={s.muted}>Loading…</p>
              : jobs.length === 0
              ? <div style={s.emptyBox}><p style={s.muted}>No jobs posted yet.</p><button style={s.smallBtn} onClick={() => navigate("/jobs")}>Check Jobs</button></div>
              : jobs.slice(0, 5).map(job => (
                <div key={job.id} style={s.row}>
                  <div style={s.companyAvatar}>{job.companyName?.[0] || "?"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.rowTitle}>{job.jobName}</div>
                    <div style={s.rowSub}>{job.companyName} · {job.postDate}</div>
                  </div>
                  {job.alreadyApplied
                    ? <span style={s.appliedTag}>Applied ✓</span>
                    : <button style={s.applyBtn} onClick={() => navigate(`/jobs/${job.id}/apply`)}>Apply</button>
                  }
                </div>
              ))
            }
          </div>

          {/* Recent Results */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <h2 style={s.cardTitle}>📊 My ATS Results</h2>
              <button style={s.seeAll} onClick={() => navigate("/my-results")}>See all →</button>
            </div>
            {loading ? <p style={s.muted}>Loading…</p>
              : resumes.length === 0
              ? <div style={s.emptyBox}><p style={s.muted}>No submissions yet.</p><button style={s.smallBtn} onClick={() => navigate("/jobs")}>Apply to a Job</button></div>
              : resumes.slice(0, 5).map(r => (
                <div key={r.id} style={s.row}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.rowTitle}>{r.jobName || "Free ATS Analysis"}</div>
                    <div style={s.rowSub}>{(r.companyName || "Self Assessment")} · {r.uploadDate}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(r.totalScore) }}>{r.totalScore}%</div>
                    <div style={{ fontSize: 11, color: scoreColor(r.totalScore), fontWeight: 600 }}>{r.scoreLabel}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* CTA Banner */}
        <div style={s.cta}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 36 }}>🎯</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Deep ATS Resume Check</h3>
              <p style={{ fontSize: 13, color: "#a5b4fc", margin: "4px 0 0" }}>
                Check buzzwords, filler words, measurable impact, format, line length & more — instantly.
              </p>
            </div>
          </div>
          <button style={s.ctaBtn} onClick={() => navigate("/analyze")}>Analyze Now →</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1100, margin: "auto", padding: "28px 20px 60px" },
  hero: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 16, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  heroTitle: { fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 },
  heroSub: { fontSize: 14, color: "#c7d2fe", margin: "6px 0 0" },
  heroBtn: { background: "#fff", color: "#4f46e5", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  err: { background: "#2d1515", border: "1px solid #f87171", color: "#fca5a5", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 24 },
  statCard: { background: "#13131f", borderRadius: 14, border: "1px solid #2d2d4e", padding: "16px 18px", textAlign: "center" },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: 800, marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#64748b" },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20, marginBottom: 20 },
  card: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", padding: "20px 22px" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: 0 },
  seeAll: { background: "none", border: "none", color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e1e30" },
  companyAvatar: { width: 36, height: 36, background: "#1e1b4b", color: "#818cf8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 },
  rowTitle: { fontSize: 14, fontWeight: 600, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  applyBtn: { background: "#1e1b4b", color: "#818cf8", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  appliedTag: { background: "#052e16", color: "#34d399", fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 8, flexShrink: 0 },
  muted: { color: "#475569", fontSize: 13, padding: "8px 0", margin: 0 },
  emptyBox: { padding: "12px 0", display: "flex", alignItems: "center", gap: 12 },
  smallBtn: { background: "#1e1b4b", color: "#818cf8", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  cta: { background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 16, border: "1px solid #4f46e5", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
  ctaBtn: { background: "linear-gradient(135deg,#4f46e5,#818cf8)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" },
};
