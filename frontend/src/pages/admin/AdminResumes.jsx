import { useState, useEffect } from "react";
import { adminGetResumes, adminGetJobs, adminGetResumesByJob } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function AdminResumes() {
  const [resumes, setResumes]   = useState([]);
  const [jobs, setJobs]         = useState([]);
  const [selectedJob, setSelectedJob] = useState("all");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([adminGetResumes(), adminGetJobs()])
      .then(([r, j]) => { setResumes(r); setJobs(j); })
      .finally(() => setLoading(false));
  }, []);

  const handleJobFilter = async (jobId) => {
    setSelectedJob(jobId); setLoading(true);
    try {
      const data = jobId === "all" ? await adminGetResumes() : await adminGetResumesByJob(jobId);
      setResumes(data);
    } finally { setLoading(false); }
  };

  const sc  = (v) => v >= 70 ? "#34d399" : v >= 50 ? "#fbbf24" : "#f87171";
  const sbg = (v) => v >= 70 ? "#052e16" : v >= 50 ? "#2d1f00" : "#2d1515";

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + (r.totalScore || 0), 0) / resumes.length) : 0;

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Resume Submissions</h1>
            <p style={s.sub}>{resumes.length} total · Average score: {avgScore}%</p>
          </div>
          <select style={s.select} value={selectedJob} onChange={e => handleJobFilter(e.target.value)}>
            <option value="all">All Jobs</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.jobName} — {j.companyName}</option>)}
          </select>
        </div>
        {loading ? <div style={s.empty}>Loading…</div> : resumes.length === 0 ? (
          <div style={s.emptyCard}>No resume submissions found</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {["Candidate","Job Applied","Score","Matched Skills","Missing Skills","Experience","Date"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumes.map(r => (
                  <tr key={r.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.candidateName}>{r.candidateName || "Unknown"}</div>
                      <div style={s.candidateEmail}>{r.candidateEmail}</div>
                      <div style={s.resumeFile}>📄 {r.resumeName}</div>
                    </td>
                    <td style={s.td}>
                      <div style={s.jobName}>{r.jobName}</div>
                      <div style={s.company}>{r.companyName}</div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.scorePill, background: sbg(r.totalScore), color: sc(r.totalScore) }}>{r.totalScore}%</span>
                      <div style={{ ...s.scoreLabel, color: sc(r.totalScore) }}>{r.scoreLabel}</div>
                    </td>
                    <td style={s.td}>
                      <div style={s.skillsWrap}>
                        {(r.matchedSkills || []).slice(0,4).map(sk => (
                          <span key={sk} style={{ ...s.skillTag, background: "#052e16", color: "#34d399" }}>{sk}</span>
                        ))}
                        {(r.matchedSkills || []).length > 4 && <span style={{ ...s.skillTag, background: "#052e16", color: "#34d399" }}>+{r.matchedSkills.length - 4}</span>}
                        {(r.matchedSkills || []).length === 0 && <span style={s.none}>None</span>}
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={s.skillsWrap}>
                        {(r.missingSkills || []).slice(0,4).map(sk => (
                          <span key={sk} style={{ ...s.skillTag, background: "#2d1515", color: "#f87171" }}>{sk}</span>
                        ))}
                        {(r.missingSkills || []).length > 4 && <span style={{ ...s.skillTag, background: "#2d1515", color: "#f87171" }}>+{r.missingSkills.length - 4}</span>}
                        {(r.missingSkills || []).length === 0 && <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>All matched ✓</span>}
                      </div>
                    </td>
                    <td style={s.td}><span style={s.exp}>{r.experienceYears > 0 ? `${r.experienceYears} yr${r.experienceYears !== 1 ? "s" : ""}` : "—"}</span></td>
                    <td style={s.td}><span style={s.date}>{r.uploadDate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1200, margin: "auto", padding: "28px 20px 60px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
  sub: { fontSize: 14, color: "#64748b" },
  select: { padding: "9px 14px", borderRadius: 10, border: "1.5px solid #2d2d4e", fontSize: 14, outline: "none", background: "#13131f", color: "#e2e8f0" },
  empty: { textAlign: "center", padding: 40, color: "#64748b" },
  emptyCard: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", padding: "40px 24px", textAlign: "center", color: "#64748b" },
  tableWrap: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  thead: { background: "#1a1a2e" },
  th: { padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #2d2d4e" },
  tr: { borderBottom: "1px solid #1e1e30" },
  td: { padding: "14px 16px", verticalAlign: "top" },
  candidateName: { fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 2 },
  candidateEmail: { fontSize: 12, color: "#64748b", marginBottom: 2 },
  resumeFile: { fontSize: 11, color: "#475569" },
  jobName: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 },
  company: { fontSize: 12, color: "#64748b" },
  scorePill: { display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 14, fontWeight: 800 },
  scoreLabel: { fontSize: 11, fontWeight: 600, marginTop: 4 },
  skillsWrap: { display: "flex", flexWrap: "wrap", gap: 4 },
  skillTag: { padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  none: { fontSize: 12, color: "#475569" },
  exp: { fontSize: 13, color: "#94a3b8", fontWeight: 600 },
  date: { fontSize: 12, color: "#64748b" },
};
