import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, analyzeResume } from "../api/client";
import Navbar from "../components/Navbar";

const scoreColor = (v) => v >= 70 ? "#34d399" : v >= 50 ? "#fbbf24" : "#f87171";
const sevBg = { HIGH: "#2d1515", MEDIUM: "#2d1f00", LOW: "#1a1a2e", PASS: "#052e16" };
const sevColor = { HIGH: "#fca5a5", MEDIUM: "#fde68a", LOW: "#94a3b8", PASS: "#6ee7b7" };

export default function UploadResume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob]       = useState(null);
  const [file, setFile]     = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    getJobById(id)
      .then(setJob)
      .catch(() => setError("Job not found."))
      .finally(() => setJobLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a resume file"); return; }
    try {
      setLoading(true); setError("");
      const data = await analyzeResume(id, file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={s.page}>
        <button style={s.back} onClick={() => navigate("/jobs")}>← Back to Jobs</button>

        {/* Job Info */}
        {jobLoading ? <div style={s.muted}>Loading job…</div>
          : job && !result && (
            <div style={s.jobCard}>
              <div style={s.jobAvatar}>{job.companyName?.[0] || "?"}</div>
              <div>
                <h2 style={s.jobName}>{job.jobName}</h2>
                <p style={s.jobComp}>{job.companyName} {job.salary && `· ${job.salary}`} {job.requiredExperienceYears > 0 && `· ${job.requiredExperienceYears}+ yrs`}</p>
                {(job.skills || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {job.skills.map(sk => <span key={sk} style={s.skill}>{sk}</span>)}
                  </div>
                )}
              </div>
            </div>
          )
        }

        {error && <div style={s.err}>{error}</div>}

        {/* Upload Form */}
        {!result && !jobLoading && (
          <div style={s.uploadCard}>
            <h2 style={s.cardTitle}>📄 Upload Your Resume</h2>
            <p style={s.cardSub}>Your resume will be analyzed against this job's requirements using our ATS checker.</p>
            <form onSubmit={handleSubmit}>
              <label style={{ ...s.dropzone, borderColor: file ? "#4f46e5" : "#2d2d4e", background: file ? "#1e1b4b" : "#1a1a2e" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40 }}>{file ? "✅" : "📤"}</div>
                  {file
                    ? <><p style={{ color: "#818cf8", fontWeight: 700, margin: "8px 0 0" }}>{file.name}</p><p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>{(file.size / 1024).toFixed(1)} KB</p></>
                    : <><p style={{ color: "#94a3b8", fontWeight: 600, margin: "8px 0 0" }}>Click or drag & drop your resume</p><p style={{ color: "#475569", fontSize: 13 }}>PDF, DOCX, DOC, TXT · Max 10MB</p></>
                  }
                </div>
                <input type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: "none" }}
                  onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
              </label>
              <button style={{ ...s.btn, opacity: (loading || !file) ? 0.6 : 1, cursor: (loading || !file) ? "not-allowed" : "pointer" }}
                disabled={loading || !file}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={s.spinner} />Analyzing…</span>
                  : "🚀 Analyze Resume"
                }
              </button>
            </form>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={s.resultsCard}>
            <div style={s.resultHeader}>
              <div>
                <div style={{ fontSize: 52, fontWeight: 900, color: scoreColor(result.totalScore) }}>{result.totalScore}%</div>
                <div style={{ fontSize: 14, color: scoreColor(result.totalScore), fontWeight: 700 }}>{result.scoreLabel}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>ATS Match Score</div>
              </div>
              <div style={s.scoreBars}>
                {[
                  ["Skills", result.skillScore, 50],
                  ["Experience", result.experienceScore, 20],
                  ["Education", result.educationScore, 15],
                  ["Keywords", result.keywordScore, 15],
                ].map(([label, val, max]) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>
                      <span>{label}</span><span style={{ color: scoreColor((val / max) * 100) }}>{val}/{max}</span>
                    </div>
                    <div style={{ background: "#1e1e30", borderRadius: 4, height: 6 }}>
                      <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, background: scoreColor((val / max) * 100), height: "100%", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={s.twoCol}>
              <div style={s.panel}>
                <h3 style={s.panelTitle}>✅ Matched Skills ({(result.matchedSkills || []).length})</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(result.matchedSkills || []).length === 0
                    ? <p style={{ color: "#64748b", fontSize: 13 }}>No skills matched.</p>
                    : result.matchedSkills.map(sk => <span key={sk} style={{ background: "#052e16", color: "#34d399", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sk}</span>)
                  }
                </div>
              </div>
              <div style={s.panel}>
                <h3 style={s.panelTitle}>❌ Missing Skills ({(result.missingSkills || []).length})</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(result.missingSkills || []).length === 0
                    ? <p style={{ color: "#64748b", fontSize: 13 }}>All required skills found!</p>
                    : result.missingSkills.map(sk => <span key={sk} style={{ background: "#2d1515", color: "#f87171", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sk}</span>)
                  }
                </div>
              </div>
            </div>

            {/* ATS Issues */}
            {(result.atsIssues || []).length > 0 && (
              <div style={s.panel}>
                <h3 style={s.panelTitle}>⚠️ ATS Issues & Suggestions</h3>
                {result.atsIssues.filter(i => i.severity !== "PASS").map((issue, i) => (
                  <div key={i} style={{ ...s.issueRow, background: sevBg[issue.severity], borderLeft: `3px solid ${sevColor[issue.severity]}`, padding: "10px 12px", borderRadius: "0 8px 8px 0", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[issue.severity] }}>[{issue.category} · {issue.severity}]</span>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>{issue.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              <button style={s.btn} onClick={() => { setResult(null); setFile(null); }}>Upload Different Resume</button>
              <button style={{ ...s.btn, background: "#1e1b4b", color: "#818cf8" }} onClick={() => navigate("/my-results")}>View All My Results</button>
              <button style={{ ...s.btn, background: "#052e16", color: "#34d399" }} onClick={() => navigate("/analyze")}>Deep ATS Check</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 860, margin: "auto", padding: "28px 20px 60px" },
  back: { background: "none", border: "none", color: "#818cf8", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "0 0 16px", display: "block" },
  jobCard: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 },
  jobAvatar: { width: 50, height: 50, background: "#1e1b4b", color: "#818cf8", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, flexShrink: 0 },
  jobName: { fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  jobComp: { fontSize: 13, color: "#64748b", margin: "4px 0 0" },
  skill: { background: "#1e1b4b", color: "#a5b4fc", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },
  err: { background: "#2d1515", border: "1px solid #f87171", color: "#fca5a5", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  uploadCard: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "24px" },
  cardTitle: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" },
  cardSub: { fontSize: 13, color: "#64748b", margin: "0 0 20px" },
  dropzone: { display: "flex", justifyContent: "center", alignItems: "center", border: "2px dashed", borderRadius: 12, padding: "36px 20px", cursor: "pointer", marginBottom: 16 },
  btn: { width: "100%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  spinner: { width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" },
  muted: { color: "#64748b", fontSize: 14, padding: "12px 0" },
  resultsCard: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "24px" },
  resultHeader: { display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #2d2d4e", marginBottom: 20 },
  scoreBars: { flex: 1, minWidth: 200 },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 16 },
  panel: { background: "#0f0f1a", borderRadius: 12, border: "1px solid #2d2d4e", padding: "14px 16px", marginBottom: 16 },
  panelTitle: { fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" },
  issueRow: {},
};
