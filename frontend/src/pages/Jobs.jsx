import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../api/client";
import Navbar from "../components/Navbar";

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError]   = useState("");

  useEffect(() => {
    getJobs()
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => setError(err.response?.data?.error || "Failed to load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    j.jobName?.toLowerCase().includes(search.toLowerCase()) ||
    j.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    (j.skills || []).some(sk => sk.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Job Listings</h1>
            <p style={s.sub}>{jobs.length} active position{jobs.length !== 1 ? "s" : ""} available</p>
          </div>
          <input style={s.search} placeholder="🔍 Search by job, company, or skill…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {error && <div style={s.err}>{error}</div>}

        {loading ? (
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={{ color: "#64748b", marginTop: 12 }}>Loading jobs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.center}>
            <p style={{ fontSize: 40 }}>🔍</p>
            <p style={{ color: "#64748b" }}>{search ? `No jobs found for "${search}"` : "No jobs posted yet."}</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(job => (
              <div key={job.id} style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.avatar}>{job.companyName?.[0] || "?"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.jobName}>{job.jobName}</div>
                    <div style={s.company}>{job.companyName}</div>
                  </div>
                  {job.alreadyApplied && <span style={s.appliedBadge}>Applied ✓</span>}
                </div>

                <p style={s.desc}>{job.jobDetails || "No description provided."}</p>

                <div style={s.skillsRow}>
                  {(job.skills || []).slice(0, 5).map(sk => (
                    <span key={sk} style={s.skill}>{sk}</span>
                  ))}
                  {(job.skills || []).length > 5 && (
                    <span style={s.skillMore}>+{job.skills.length - 5}</span>
                  )}
                </div>

                <div style={s.metaRow}>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {job.postDate && <span style={s.meta}>📅 {job.postDate}</span>}
                    {job.salary && <span style={s.meta}>💰 {job.salary}</span>}
                    {job.requiredExperienceYears > 0 && (
                      <span style={s.meta}>⏱️ {job.requiredExperienceYears}+ yrs</span>
                    )}
                  </div>
                  {job.alreadyApplied
                    ? <span style={s.appliedBtn}>Applied ✓</span>
                    : <button style={s.applyBtn} onClick={() => navigate(`/jobs/${job.id}/apply`)}>
                        Apply Now →
                      </button>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page: { maxWidth: 1100, margin: "auto", padding: "28px 20px 60px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" },
  title: { fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: "4px 0 0" },
  search: { background: "#13131f", border: "1px solid #2d2d4e", color: "#f1f5f9", padding: "10px 16px", borderRadius: 10, fontSize: 14, width: 280, outline: "none" },
  err: { background: "#2d1515", border: "1px solid #f87171", color: "#fca5a5", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  center: { textAlign: "center", padding: "60px 20px" },
  spinner: { width: 36, height: 36, border: "3px solid #2d2d4e", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 },
  card: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 14 },
  cardTop: { display: "flex", gap: 12, alignItems: "flex-start" },
  avatar: { width: 44, height: 44, background: "#1e1b4b", color: "#818cf8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0 },
  jobName: { fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 },
  company: { fontSize: 13, color: "#64748b", marginTop: 3 },
  appliedBadge: { background: "#052e16", color: "#34d399", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" },
  desc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  skill: { background: "#1e1b4b", color: "#a5b4fc", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },
  skillMore: { background: "#2d2d4e", color: "#64748b", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },
  metaRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, paddingTop: 4, borderTop: "1px solid #1e1e30" },
  meta: { fontSize: 12, color: "#64748b" },
  applyBtn: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  appliedBtn: { background: "#052e16", color: "#34d399", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "none" },
};
